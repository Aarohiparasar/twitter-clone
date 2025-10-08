import { useState } from "react";
import axios from "axios";
import { useUserContext } from '../../components/context/context'

const API_URL = import.meta.env.VITE_API_URL;

const EditProfileModal = () => {
  const { userData, setUpdatedData } = useUserContext(); // update context after API call
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    bio: "",
    link: "",
    newPassword: "",
    currentPassword: "",
  });

  const [error, setError] = useState("");

  // ✅ Handle input changes properly
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedData = {
      fullName: formData.fullName.trim(),
      username: formData.username.trim(),
      email: formData.email.trim(),
      bio: formData.bio?.trim(),
      link: formData.link?.trim(),
      newPassword: formData.newPassword,
      currentPassword: formData.currentPassword,
    };

    try {
      const res = await axios.post(`${API_URL}/user/update`, trimmedData, {
        withCredentials: true,
      });

      if (res.status === 200) {

        const isUsernameChanged = res?.data?.username && res?.data?.username !== userData?.username;
        const isPasswordChanged = res?.data?.passwordChanged; // assuming backend sends this flag

        if (isUsernameChanged || isPasswordChanged) {
          alert("Profile updated! Please log in again due to credential change.");

          // 🔒 Clear local storage and reset context
          localStorage.removeItem("token");
          setUpdatedData(null);
window.location.href = "/login";
          return
        }

        alert("Profile updated successfully!");
        setUpdatedData(data)
        setError("");
        // ✅ Close the modal programmatically
        document.getElementById("edit_profile_modal").close();
      }
    } catch (err) {
      setError(err?.response?.data?.error || "Something went wrong");
      console.error(err);
    }
  };

  return (
    <>
      <button
        className="btn btn-outline rounded-full btn-sm"
        onClick={() => document.getElementById("edit_profile_modal").showModal()}
      >
        Edit profile
      </button>

      <dialog id="edit_profile_modal" className="modal">
        <div className="modal-box border rounded-md border-gray-700 shadow-md">
          <h3 className="font-bold text-lg my-3">Update Profile</h3>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                placeholder="Full Name"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.fullName}
                name="fullName"
                onChange={handleInputChange}
              />
              <input
                type="text"
                placeholder="Username"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.username}
                name="username"
                onChange={handleInputChange}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <input
                type="email"
                placeholder="Email"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.email}
                name="email"
                onChange={handleInputChange}
              />
              <textarea
                placeholder="Bio"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.bio}
                name="bio"
                onChange={handleInputChange}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <input
                type="password"
                placeholder="Current Password"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.currentPassword}
                name="currentPassword"
                onChange={handleInputChange}
              />
              <input
                type="password"
                placeholder="New Password"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.newPassword}
                name="newPassword"
                onChange={handleInputChange}
              />
            </div>

            <input
              type="text"
              placeholder="Link"
              className="flex-1 input border border-gray-700 rounded p-2 input-md"
              value={formData.link}
              name="link"
              onChange={handleInputChange}
            />

            <button className="btn btn-primary rounded-full btn-sm text-white">
              Update
            </button>
          </form>
        </div>

        <form method="dialog" className="modal-backdrop">
          <button className="outline-none">close</button>
        </form>
      </dialog>
    </>
  );
};

export default EditProfileModal; 