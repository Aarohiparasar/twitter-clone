import Notification from "../models/notification.models.js";
export const getNotification = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log(userId)
    const notifications = await Notification.find({ to: userId }).populate({
      path: "from",
      select: "username ProfileImg",
    });

    await Notification.updateMany({ to: userId }, { read: true });
    res.status(200).json(notifications);
  } catch (error) {
    console.log("error in getNotification controller: ", error.message);
    res.status(500).json({ error: "internal server error" });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const userId = req.user._id;
    await Notification.deleteMany({ to: userId });
    res.status(200).json({ message: "notification deleted successfully" });
  } catch (error) {
    console.log("error in deleteNotification controller: ", error.message);
    res.status(500).json({ error: "internal server error" });
  }
};
