import React from "react";
import { Modal, Button } from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";

interface AlertProps {
  title: string;
  msg: string;
  open: boolean;
  type: "info" | "success" | "error" | "yesorno";
  onClose: () => void;
  onConfirm?: () => void;
}

const Alert: React.FC<AlertProps> = ({ title, msg, open, type, onClose, onConfirm }) => {
  return (
    <Modal 
      title={title}
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      closeIcon={<CloseCircleOutlined style={{ fontSize: "18px" }} />}
    >
      <p style={{ textAlign: "center", padding: "10px 0" }}>{msg}</p>

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        {type === "info" && (
          <Button type="primary" onClick={onClose}>
            OK
          </Button>
        )}
        {type === "success" && (
          <Button type="primary" onClick={onClose}>
            OK
          </Button>
        )}
        {type === "error" && (
          <Button type="primary" danger onClick={onClose}>
            Close
          </Button>
        )}
        {type === "yesorno" && (
          <>
            <Button type="primary" onClick={onConfirm}>
              Yes
            </Button>
            <Button type="default" danger onClick={onClose} style={{ marginLeft: "10px" }}>
              No
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
};

export default Alert;
