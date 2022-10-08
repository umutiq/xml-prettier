import React from "react";
import styles from "../styles/Home.module.css";
import { useDropzone } from "react-dropzone";

const Home = () => {
  const [fileName, setFileName] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    maxFiles: 1,
    accept: {
      "text/xml": [".xml"],
    },
  });
  const handleOnSubmit = React.useCallback(async () => {
    if (acceptedFiles.length === 0) {
      alert("Please, select file you want to upload");
      return;
    }
    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", acceptedFiles[0]);
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Generated";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setIsLoading(false);
  }, [acceptedFiles]);

  React.useEffect(() => {
    if (acceptedFiles.length > 0) {
      setFileName(acceptedFiles[0].path);
      handleOnSubmit();
    } else {
      setFileName("");
    }
  }, [acceptedFiles, handleOnSubmit]);

  return (
    <section className={styles.container}>
      <div {...getRootProps({ className: "dropzone" })}>
        <input {...getInputProps()} />
        <p>
          {fileName
            ? fileName
            : "Drag and drop some files here, or click to select files"}{" "}
          {isLoading && <span>( Please wait while uploading.. )</span>}
        </p>
      </div>
    </section>
  );
};

export default Home;
