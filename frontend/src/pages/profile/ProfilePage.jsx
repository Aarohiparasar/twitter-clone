import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Posts from "../../components/common/Posts";
import ProfileHeaderSkeleton from "../../components/skeletons/ProfileHeaderSkeleton";
import EditProfileModal from "./EditProfileModal";
import axios from "axios";

import { POSTS } from "../../utils/db/dummy";
const API_URL = import.meta.env.VITE_API_URL;

import { FaArrowLeft } from "react-icons/fa6";
import { IoCalendarOutline } from "react-icons/io5";
import { FaLink } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { useUserContext } from '../../components/context/context'

const ProfilePage = () => {
  const { userData,updatedData,setUpdatedData,userProfile } = useUserContext(); // update context after API call
  const [coverImg, setCoverImg] = useState(null);
  const [profileImg, setProfileImg] = useState(null);
  const [feedType, setFeedType] = useState("posts");
  const [isUpdating, setIsUpdating] = useState(false);

  const options = { day: "numeric", month: "short", year: "numeric" };
  const formattedDate = new Date(userData?.createdAt).toLocaleDateString("en-GB", options);
  const coverImgRef = useRef(null);
  const profileImgRef = useRef(null);

  const isLoading = false;
  const isMyProfile = true;

  const user = {
    _id: updatedData?._id,
    fullName: updatedData?.fullName,
    username: updatedData?.username,
    profileImg: updatedData?.profileImg || "/avatars/boy2.png",
    coverImg: updatedData?.coverImg || "/cover.png",
    bio: updatedData?.bio || "Lorem ipsum dolor sit amet.",
    link: updatedData?.link,
    following: updatedData?.following || ["1", "2", "3"],
    followers: updatedData?.followers || ["1", "2", "3"],
  };

  const handleImgChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (type === "coverImg") setCoverImg(file); // store file instead of base64
        if (type === "profileImg") setProfileImg(file);
      };
      reader.readAsDataURL(file);
    }
  };

const handleUpdateProfile = async () => {
  if (!coverImg && !profileImg) return;

  const formData = new FormData();
  if (coverImg) formData.append("coverImg", coverImg);
  if (profileImg) formData.append("profileImg", profileImg);

  setIsUpdating(true);
console.log(formData)
  try {
    const { data } = await axios.post(`${API_URL}/user/update`, formData, {
      withCredentials: true, // sends cookies automatically if backend uses sessions
    });
console.log(data,'upadted data.........')
    setUpdatedData(data); // backend returns updated user object
    setCoverImg(null);
    setProfileImg(null);
    alert("Profile updated successfully!");
  } catch (err) {
    console.error(err);
    alert(err.response?.data?.error || "Something went wrong while updating profile.");
  } finally {
    setIsUpdating(false);
  }
};


  return (
    <div className='flex-[4_4_0] border-r border-gray-700 min-h-screen'>
      {isLoading && <ProfileHeaderSkeleton />}
      {!isLoading && !user && <p className='text-center text-lg mt-4'>User not found</p>}
      {!isLoading && user && (
        <>
          <div className='flex gap-10 px-4 py-2 items-center'>
            <Link to='/'><FaArrowLeft className='w-4 h-4' /></Link>
            <div className='flex flex-col'>
              <p className='font-bold text-lg'>{user?.fullName}</p>
              <span className='text-sm text-slate-500'>{POSTS?.length} posts</span>
            </div>
          </div>

          {/* COVER IMAGE */}
          <div className='relative group/cover'>
            <img
              src={coverImg ? URL.createObjectURL(coverImg) : user?.coverImg || "/cover.png"}
              className='h-52 w-full object-cover'
              alt='cover'
            />
            {isMyProfile && (
              <div
                className='absolute top-2 right-2 rounded-full p-2 bg-gray-800 bg-opacity-75 cursor-pointer opacity-0 group-hover/cover:opacity-100 transition duration-200'
                onClick={() => coverImgRef.current.click()}
              >
                <MdEdit className='w-5 h-5 text-white' />
              </div>
            )}
            <input type='file' hidden ref={coverImgRef} onChange={(e) => handleImgChange(e, "coverImg")} />
            <input type='file' hidden accept="image/*" ref={profileImgRef} onChange={(e) => handleImgChange(e, "profileImg")} />

            {/* PROFILE AVATAR */}
            <div className='avatar absolute -bottom-16 left-4'>
              <div className='w-32 rounded-full relative group/avatar'>
                <img src={profileImg ? URL.createObjectURL(profileImg) : user?.profileImg || "/avatar-placeholder.png"} />
                <div className='absolute top-5 right-3 p-1 bg-primary rounded-full group-hover/avatar:opacity-100 opacity-0 cursor-pointer'>
                  {isMyProfile && <MdEdit className='w-4 h-4 text-white' onClick={() => profileImgRef.current.click()} />}
                </div>
              </div>
            </div>
          </div>

          <div className='flex justify-end px-4 mt-5'>
            {isMyProfile && <EditProfileModal />}
            {(coverImg || profileImg) && (
              <button
                className='btn btn-primary rounded-full btn-sm text-white px-4 ml-2'
                onClick={handleUpdateProfile}
                disabled={isUpdating}
              >
                {isUpdating ? "Updating..." : "Update"}
              </button>
            )}
          </div>

          {/* USER INFO & FEED */}
          <div className='flex flex-col gap-4 mt-14 px-4'>
            <div className='flex flex-col'>
              <span className='font-bold text-lg'>{user?.fullName}</span>
              <span className='text-sm text-slate-500'>@{user?.username}</span>
              <span className='text-sm my-1'>{user?.bio}</span>
            </div>

            <div className='flex gap-2 flex-wrap'>
              {user?.link && (
                <div className='flex gap-1 items-center'>
                  <FaLink className='w-3 h-3 text-slate-500' />
                  <a href={user?.link} target='_blank' rel='noreferrer' className='text-sm text-blue-500 hover:underline'>{user?.link}</a>
                </div>
              )}
              <div className='flex gap-2 items-center'>
                <IoCalendarOutline className='w-4 h-4 text-slate-500' />
                <span className='text-sm text-slate-500'>{formattedDate}</span>
              </div>
            </div>

            <div className='flex gap-2'>
              <div className='flex gap-1 items-center'>
                <span className='font-bold text-xs'>{user?.following.length}</span>
                <span className='text-slate-500 text-xs'>Following</span>
              </div>
              <div className='flex gap-1 items-center'>
                <span className='font-bold text-xs'>{user?.followers.length}</span>
                <span className='text-slate-500 text-xs'>Followers</span>
              </div>
            </div>
          </div>

          <div className='flex w-full border-b border-gray-700 mt-4'>
            <div
              className='flex justify-center flex-1 p-3 hover:bg-secondary transition duration-300 relative cursor-pointer'
              onClick={() => setFeedType("posts")}
            >
              Posts
              {feedType === "posts" && <div className='absolute bottom-0 w-10 h-1 rounded-full bg-primary' />}
            </div>
            <div
              className='flex justify-center flex-1 p-3 text-slate-500 hover:bg-secondary transition duration-300 relative cursor-pointer'
              onClick={() => setFeedType("likes")}
            >
              Likes
              {feedType === "likes" && <div className='absolute bottom-0 w-10 h-1 rounded-full bg-primary' />}
            </div>
          </div>
        </>
      )}

      <Posts />
    </div>
  );
};

export default ProfilePage;
