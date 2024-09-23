import { toast } from "react-toastify";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"; // Firebase Storage imports

export const displayError = (err) => {
  const message = err?.message?.split(":")[1]?.trim() || "An error occurred";
  toast.error(message.replace(".", ""));
};

export const sortFn = (a, b) => {
  var dateA = new Date(a.createdAt).getTime();
  var dateB = new Date(b.createdAt).getTime();
  return dateA < dateB ? 1 : -1;
};

export const uploadImage = async (file) => {
  const storage = getStorage();
  const storageRef = ref(storage, `images/${file.name}`);
  let toastId = null;

  try {
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = snapshot.bytesTransferred / snapshot.totalBytes;

          if (toastId === null) {
            toastId = toast("Upload in progress", {
              progress,
              bodyClassName: "upload-progress-bar",
            });
          } else {
            toast.update(toastId, {
              progress,
            });
          }
        },
        (error) => {
          toast.dismiss(toastId);
          displayError(error);
          reject(error);
        },
        async () => {
          toast.dismiss(toastId);
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  } catch (error) {
    displayError(error);
    throw error;
  }
};
