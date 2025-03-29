import { CiImageOn } from "react-icons/ci";
import { BsEmojiSmileFill } from "react-icons/bs";
import { useRef, useState } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { useUserContext } from "../../context/userContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { shareNewPost } from "../../api/posts/posts";
import { toast } from "react-hot-toast";

const CreatePost = () => {
  const queryClient = useQueryClient();
  const { user } = useUserContext();
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const imgRef = useRef(null);

  const sharePostMutation = useMutation({
    mutationFn: shareNewPost,
    onSuccess: (data) => {
      console.log("Post shared successfully:", data);
      setText(""); // Clear text field after post
      setImagePreview(null); // Clear image preview
      setSelectedFile(null); // Clear file state
      imgRef.current.value = null; // Reset file input
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["profile", user.username] });
    },
    onError: (error) => {
      console.error("Error sharing post:", error);
      toast.error(error.message || "Something went wrong. Please try again.");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("text", text);
    if (selectedFile) {
      formData.append("img", selectedFile); // Attach image file
    }
    sharePostMutation.mutate(formData);
  };

  const handleImgChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file); // Save the file for upload

      // Show a preview before uploading
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex p-4 items-start gap-4 border-b border-gray-700">
      {/* Profile Image */}
      <div className="avatar">
        <div className="w-8 rounded-full">
          <img src={user.profileImg || "/avatar-placeholder.png"} alt="User" />
        </div>
      </div>

      {/* Form */}
      <form className="flex flex-col gap-2 w-full" onSubmit={handleSubmit}>
        {/* Textarea */}
        <textarea
          className="textarea w-full p-0 text-lg resize-none border-none focus:outline-none border-gray-800"
          placeholder="What is happening?!"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        {/* Image Preview */}
        {imagePreview && (
          <div className="relative w-72 mx-auto">
            <IoCloseSharp
              className="absolute top-0 right-0 text-white bg-gray-800 rounded-full w-5 h-5 cursor-pointer"
              onClick={() => {
                setImagePreview(null);
                setSelectedFile(null);
                imgRef.current.value = null;
              }}
            />
            <img
              src={imagePreview}
              className="w-full mx-auto h-72 object-contain rounded"
              alt="Preview"
            />
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-between border-t py-2 border-t-gray-700">
          <div className="flex gap-1 items-center">
            <CiImageOn
              className="fill-primary w-6 h-6 cursor-pointer"
              onClick={() => imgRef.current.click()}
            />
            <BsEmojiSmileFill className="fill-primary w-5 h-5 cursor-pointer" />
          </div>
          <input type="file" hidden ref={imgRef} onChange={handleImgChange} />
          <button
            className="btn btn-primary rounded-full btn-sm text-white px-4"
            type="submit"
            disabled={sharePostMutation.isPending}
          >
            {sharePostMutation.isPending ? "Posting..." : "Post"}
          </button>
        </div>

        {/* Error Message */}
        {sharePostMutation.isError && (
          <div className="text-red-500">{sharePostMutation.error.message}</div>
        )}
      </form>
    </div>
  );
};

export default CreatePost;
