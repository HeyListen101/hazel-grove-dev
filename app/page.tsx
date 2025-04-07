import AuthButton from "@/components/header-auth";

export default async function Home() {
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="w-full bg-[#57503A] text-white p-4 flex justify-between items-center shadow-md">
        <h1 className="text-2xl font-bold">Visita</h1>
        <AuthButton />
      </header>

      {/* Hero Section */}
      <div
        className="flex flex-col flex-grow justify-center items-center text-white text-center w-full"
        style={{
          backgroundImage:
            "url('https://www.eduopinions.com/wp-content/uploads/2017/09/Visayas-State-University-VSU-campus.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <h2 className="text-4xl font-bold mb-4">Welcome to Visita</h2>
        <p className="text-lg mb-6">Go to the market, without actually going to the market!</p>
      </div>
    </div>
  );
}