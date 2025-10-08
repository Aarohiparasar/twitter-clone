import express from "express";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";

import User from "../models/user.models.js";
import Notification from "../models/notification.models.js";

// Helper function to upload buffer to Cloudinary
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const base64 = `data:image/jpeg;base64,${fileBuffer.toString("base64")}`;
    cloudinary.uploader.upload(base64, { resource_type: "image" }, (err, result) => {
      if (err) return reject(err);
      resolve(result.secure_url);
    });
  });
};

export const getUserProfile = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({  username: username.trim() }).select("-password");
   //  console.log(user)
    if (!user) {
      return res.status(400).json({ error: `user not found` });
    }
    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ error: `internal server error in getting the user profile` });
  }
};

export const followUnfollowUser = async (req, res) => {
  const { id } = req.params;
  try {
    const userToModify = await User.findById(id);
    const currentUser = await User.findById(req.user._id);

    if (id == req.user._id.toString()) {
      return res
        .status(400)
        .json({ error: "can not follow and unfollow yourself" });
    }

    if (!currentUser || !userToModify) {
      return res.status(400).json({ error: "user not found" });
    }
    const isFollowing = currentUser.following.includes(id);
    if (isFollowing) {
      //unfollow
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
      res.status(200).json({ Message: "user unfollowed succesfully" });
    } else {
      //follow
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });

      //send notification
      const newNotification = new Notification({
        type: "follow",
        from: req.user._id,
        to: userToModify._id,
      });
      await newNotification.save();
      res.status(200).json({ Message: "user followed succesfully" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: `internal server error in follow and unfollow the user` });
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user._id;
    const usersFollowedByMe = await User.findById(userId).select("following");

    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      {
        $sample: { size: 10 },
      },
    ]);

    const filteredUser = users.filter(
      (user) => !usersFollowedByMe.following.includes(user._id)
    );
    const suggestedUsers = filteredUser.slice(0, 4);
    suggestedUsers.forEach((user) => (user.password = null));
    res.status(200).json(suggestedUsers);
  } catch (error) {
    res.status(500).json({ error: error.Message });
  }
};

export const updateUserProfile = async (req, res) => {
  const { fullName, email, username, currentPassword, newPassword, link, bio } = req.body;
  const userId = req.user._id;

  try {
    // Fetch user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Password update logic
    if ((currentPassword && !newPassword) || (!currentPassword && newPassword)) {
      return res.status(400).json({ error: "Provide both current and new password" });
    }

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return res.status(400).json({ error: "Current password is incorrect" });
      if (newPassword.length < 6)
        return res.status(400).json({ error: "New password must be at least 6 characters" });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    // Profile image
    if (req.files?.profileImg?.[0]) {
      if (user.profileImg) {
        const publicId = user.profileImg.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      }
      user.profileImg = await uploadToCloudinary(req.files.profileImg[0].buffer);
    }

    // Cover image
    if (req.files?.coverImg?.[0]) {
      if (user.coverImg) {
        const publicId = user.coverImg.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      }
      user.coverImg = await uploadToCloudinary(req.files.coverImg[0].buffer);
    }

    // Update other fields
    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.link = link || user.link;

    // Save updated user
    await user.save();

    user.password = null; // remove password before sending
    res.status(200).json(user);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

  
