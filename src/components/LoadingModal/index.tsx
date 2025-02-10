import React from "react";
import { Modal, Box, CircularProgress } from "@mui/material";

interface LoadingModalProps {
  open: boolean;
}

const LoadingModal: React.FC<LoadingModalProps> = ({ open }) => {
  return (
    <Modal
      open={open}
      aria-labelledby="loading-modal-title"
      aria-describedby="loading-modal-description"
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    </Modal>
  );
};

export default LoadingModal;