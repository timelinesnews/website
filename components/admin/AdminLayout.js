// components/admin/AdminLayout.js
import React from "react";
import Navbar from "../Navbar";

export default function AdminLayout({ children, title = "Admin Panel" }) {
  return (
    <>
      <Navbar />
      <div style={styles.wrapper}>
        <h1 style={styles.title}>{title}</h1>
        <div>{children}</div>
      </div>
    </>
  );
}

const styles = {
  wrapper: {
    maxWidth: 1100,
    margin: "40px auto",
    padding: "0 18px",
  },
  title: {
    marginBottom: 20,
  },
};
