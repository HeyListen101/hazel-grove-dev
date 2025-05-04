import AuthButton from "@/components/header-auth";
import backgroundImage from "@/components/assets/background-images/LandingPage.png";

export default async function Home() {
  return (
    <div 
      className="flex flex-col h-screen"
      style={{
        backgroundImage:`url(${backgroundImage.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}  
    >
      {/* Hero Section */}
      <div
        className="flex flex-col flex-grow justify-center items-center text-white text-center mx-10"
        
      >
        <h2 className="text-6xl font-bold mb-4">Welcome to Visita</h2>
        <p className="text-lg mb-6">Go to the market, without actually going to the market!</p>
        <AuthButton />
      </div>
    </div>
  );
}