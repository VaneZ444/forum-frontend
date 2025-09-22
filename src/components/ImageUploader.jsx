import React from "react";
import { Button } from "@mui/material";

export default function ImageUploader({ onFiles }) {
  const inputRef = React.useRef();

  return (
    <>
      <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={e => onFiles(e.target.files)} />
      <Button variant="outlined" onClick={() => inputRef.current.click()}>Загрузить изображения</Button>
    </>
  );
}
