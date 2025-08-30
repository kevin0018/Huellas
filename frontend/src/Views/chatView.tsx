import React from "react";
import NavBar from "../Components/NavBar";
import Footer from "../Components/footer";

export default function ChatView() {
  return (
    <>
      <NavBar />
      <div className="flex flex-col items-center justify-center background-primary px-4 py-8">
        <h1 className="h1 font-caprasimo mb-2 text-5xl text-[#51344D] drop-shadow-lg text-center">
          Chat
        </h1>
      </div>
      <Footer />
    </>
  );
}
