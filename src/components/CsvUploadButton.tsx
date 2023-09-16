import { Button } from "@mui/material";
import { useRef, useState } from "react";

type Props = {
  onSubmit: (file: File) => void;
};

export const CsvUploadButton = ({ onSubmit }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | undefined>(undefined);
  const onFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      return;
    }
    onSubmit(event.target.files[0]);
    setFile(event.target.files[0]);
    event.target.value = "";
  };
  const fileUpload = () => {
    inputRef.current?.click();
  };
  return (
    <>
      <Button sx={{ mb: 1 }} variant='contained' onClick={fileUpload}>
        UPLOAD
      </Button>
      <input
        type='file'
        hidden
        ref={inputRef}
        onChange={onFileInputChange}
        accept='text/csv'
      ></input>
      <div>{JSON.stringify(file?.name)}</div>
    </>
  );
};
