import express from "express";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";

import User from "../models/user.models.js";
import Notification from "../models/notification.models.js";
export const getUserProfile = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username }).select("-password");
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
    const { fullName, email, username, currentPassword, newPassword, link, bio } =
      req.body;
    const { profileImg, coverImg } = req.body;
    const userId = req.user._id;
  
    try {
      // Fetch the user by ID
      let user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      // Handle password update
      if (
        (!currentPassword && newPassword) ||
        (!newPassword && currentPassword)
      ) {
        return res.status(400).json({
          error: "Please provide both current password and new password",
        });
      }
  
      if (currentPassword && newPassword) {
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return res.status(400).json({ error: "Current password is incorrect" });
        }
        if (newPassword.length < 6) {
          return res
            .status(400)
            .json({ error: "New password must be at least 6 characters long" });
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
      }
  
      // Handle profile image upload
      let updatedProfileImg = user.profileImg;
      if (profileImg) {
        if (user.profileImg) {
          const publicId = user.profileImg.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(publicId);
        }
        const uploadedResponse = await cloudinary.uploader.upload(profileImg);
        updatedProfileImg = uploadedResponse.secure_url;
      }
  
      // Handle cover image upload
      let updatedCoverImg = user.coverImg;
      if (coverImg) {
        if (user.coverImg) {
          const publicId = user.coverImg.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(publicId);
        }
        const uploadedResponse = await cloudinary.uploader.upload(coverImg);
        updatedCoverImg = uploadedResponse.secure_url;
      }
  
      // Update user fields
      user.fullName = fullName || user.fullName;
      user.email = email || user.email;
      user.username = username || user.username;
      user.bio = bio || user.bio;
      user.link = link || user.link;
      user.profileImg = updatedProfileImg;
      user.coverImg = updatedCoverImg;
  
      // Save the updated user
      await user.save();
  
      // Remove password from response for security
      user.password = null;
      res.status(200).json(user);
    } catch (error) {
      console.error(`Error updating user profile: ${error.message}`);
      res.status(500).json({ error: `Internal server error: ${error.message}` });
    }
  };
  
