import Image from "next/image";
import MainPage from "./main/page";
import LoginPage from "./log-in/page";
import ProfilePage from "./profile/page";

export default function Home() {
  return (
    <>
      <LoginPage />
      <MainPage />
      <ProfilePage />
    </>
  );
}
