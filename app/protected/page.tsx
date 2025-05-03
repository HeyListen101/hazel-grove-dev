import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { MapSearchProvider } from "@/components/map-search-context";
import AuthButton from "@/components/header-auth";
import VisitaLogo from "@/components/visita-logo";
import ChatBox from "@/components/chat-component";
import MapComponent from "@/components/map-component";
import SearchBar from "@/components/search-bar";
import MapBlock from "@/components/map-block";

export default async function ProtectedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const { data } = await supabase.from("chatmessage").select();

  return (
    <MapSearchProvider>
      <header className="fixed flex justify-between items-center mt-[20px] px-[20px] w-full">
        <SearchBar />
        <AuthButton />
      </header>
      <main className="touch-auto bg-gradient-to-b from-[#89F5F4] to-[#E4F7BA] auto-size flex items-center justify-center">
        <div 
          className="w-[1280px] h-[720px] grid place-items-center gap-[2px]"
          style={{
            gridTemplateRows: "repeat(21, 1fr)",
            gridTemplateColumns: "repeat(40, 1fr)",
          }}
        >
          {/* Top-Left Stores */}
          <MapBlock rowStart={1} rowEnd={2} colStart={2} colEnd={4} color="#006600"/>
          <MapBlock rowStart={1} rowEnd={3} colStart={4} colEnd={6} color="#319900"/>
          <MapBlock rowStart={1} rowEnd={3} colStart={6} colEnd={8} color="#66CC00"/>
          <MapBlock rowStart={1} rowEnd={3} colStart={8} colEnd={10} color="#8AD70E"/>
          <MapBlock rowStart={1} rowEnd={3} colStart={10} colEnd={11} color="#90EE90"/>
          <MapBlock rowStart={1} rowEnd={3} colStart={11} colEnd={12} color="#006600"/>
          <MapBlock rowStart={1} rowEnd={3} colStart={12} colEnd={15} color="#319900"/>
          <MapBlock rowStart={1} rowEnd={3} colStart={15} colEnd={17} color="#66CC00"/>
          <MapBlock rowStart={3} rowEnd={5} colStart={1} colEnd={2} color="#8AD70E"/>

          {/* Roads and Walkways */}
          <MapBlock rowStart={3} rowEnd={4} colStart={4} colEnd={19} height={30} color="white"/>
          <MapBlock rowStart={3} rowEnd={5} colStart={18} colEnd={38} height={50} color="white"/>
          <MapBlock rowStart={1} rowEnd={22} colStart={18} colEnd={19} color="white"/>
          <MapBlock rowStart={4} rowEnd={22} colStart={37} colEnd={38} color="white"/>
          <MapBlock rowStart={5} rowEnd={21} colStart={24} colEnd={25} width={30} color="white"/>
          <MapBlock rowStart={13} rowEnd={21} colStart={33} colEnd={34} width={30} color="white"/>
          <MapBlock rowStart={13} rowEnd={18} colStart={36} colEnd={37} width={30} color="white"/>
          <MapBlock rowStart={17} rowEnd={18} colStart={24} colEnd={37} height={30} color="white"/>
          <MapBlock rowStart={20} rowEnd={21} colStart={24} colEnd={34} height={30} color="white"/>
 
          {/* Top-Right Stores */}
          <MapBlock rowStart={1} rowEnd={2} colStart={20} colEnd={21} color="#006600"/>
          <MapBlock rowStart={1} rowEnd={2} colStart={21} colEnd={22} color="#319900"/>
          <MapBlock rowStart={1} rowEnd={2} colStart={22} colEnd={23} color="#66CC00"/>
          <MapBlock rowStart={1} rowEnd={2} colStart={23} colEnd={24} color="#8AD70E"/>
          <MapBlock rowStart={1} rowEnd={2} colStart={24} colEnd={25} color="#90EE90"/>
          <MapBlock rowStart={1} rowEnd={2} colStart={25} colEnd={26} color="#006600"/>
          <MapBlock rowStart={1} rowEnd={3} colStart={26} colEnd={27} color="#319900"/>
          <MapBlock rowStart={1} rowEnd={3} colStart={27} colEnd={28} color="#66CC00"/>
          <MapBlock rowStart={1} rowEnd={3} colStart={28} colEnd={29} color="#8AD70E"/>
          <MapBlock rowStart={1} rowEnd={3} colStart={29} colEnd={30} color="#90EE90"/>
          <MapBlock rowStart={1} rowEnd={3} colStart={30} colEnd={31} color="#006600"/>
          <MapBlock rowStart={1} rowEnd={3} colStart={31} colEnd={32} color="#319900"/>
          <MapBlock rowStart={1} rowEnd={2} colStart={32} colEnd={33} color="#66CC00"/>
          <MapBlock rowStart={1} rowEnd={2} colStart={33} colEnd={34} color="#8AD70E"/>
          <MapBlock rowStart={1} rowEnd={2} colStart={34} colEnd={35} color="#90EE90"/>
          <MapBlock rowStart={1} rowEnd={2} colStart={35} colEnd={36} color="#006600"/>
          <MapBlock rowStart={1} rowEnd={2} colStart={36} colEnd={37} color="#319900"/>
          <MapBlock rowStart={1} rowEnd={3} colStart={37} colEnd={41} color="#66CC00"/>

          {/* Rightmost Stores */}
          <MapBlock rowStart={4} rowEnd={5} colStart={39} colEnd={41} color="#8AD70E"/>
          <MapBlock rowStart={5} rowEnd={6} colStart={39} colEnd={41} color="#90EE90"/>
          <MapBlock rowStart={6} rowEnd={7} colStart={39} colEnd={41} color="#006600"/>
          <MapBlock rowStart={7} rowEnd={8} colStart={39} colEnd={41} color="#319900"/>
          <MapBlock rowStart={8} rowEnd={9} colStart={39} colEnd={41} color="#66CC00"/>
          <MapBlock rowStart={9} rowEnd={10} colStart={39} colEnd={41} color="#8AD70E"/>
          <MapBlock rowStart={10} rowEnd={11} colStart={39} colEnd={41} color="#90EE90"/>
          <MapBlock rowStart={11} rowEnd={12} colStart={39} colEnd={41} color="#006600"/>
          <MapBlock rowStart={13} rowEnd={14} colStart={39} colEnd={41} color="#319900"/>
          <MapBlock rowStart={14} rowEnd={15} colStart={39} colEnd={41} color="#66CC00"/>
          <MapBlock rowStart={15} rowEnd={16} colStart={39} colEnd={41} color="#8AD70E"/>
          <MapBlock rowStart={16} rowEnd={17} colStart={39} colEnd={41} color="#90EE90"/>
          <MapBlock rowStart={17} rowEnd={18} colStart={39} colEnd={41} color="#006600"/>

          {/* Bottom Stores */}
          <MapBlock rowStart={18} rowEnd={19} colStart={25} colEnd={27} color="#319900"/>
          <MapBlock rowStart={18} rowEnd={19} colStart={27} colEnd={28} color="#66CC00"/>
          <MapBlock rowStart={18} rowEnd={19} colStart={28} colEnd={29} color="#8AD70E"/>
          <MapBlock rowStart={18} rowEnd={19} colStart={29} colEnd={30} color="#90EE90"/>
          <MapBlock rowStart={18} rowEnd={19} colStart={30} colEnd={31} color="#006600"/>
          <MapBlock rowStart={18} rowEnd={19} colStart={31} colEnd={33} color="#319900"/>
          <MapBlock rowStart={19} rowEnd={20} colStart={25} colEnd={27} color="#66CC00"/>
          <MapBlock rowStart={19} rowEnd={20} colStart={27} colEnd={28} color="#8AD70E"/>
          <MapBlock rowStart={19} rowEnd={20} colStart={28} colEnd={29} color="#90EE90"/>
          <MapBlock rowStart={19} rowEnd={20} colStart={29} colEnd={30} color="#006600"/>
          <MapBlock rowStart={19} rowEnd={20} colStart={30} colEnd={31} color="#319900"/>
          <MapBlock rowStart={19} rowEnd={20} colStart={31} colEnd={32} color="#66CC00"/>
          <MapBlock rowStart={19} rowEnd={20} colStart={32} colEnd={33} color="#8AD70E"/>

          {/* Central Places */}
          <MapBlock rowStart={5} rowEnd={18} colStart={20} colEnd={24} color="#006600"/>
          <MapBlock rowStart={7} rowEnd={17} colStart={25} colEnd={33} color="#90EE90"/>
          <MapBlock rowStart={13} rowEnd={15} colStart={34} colEnd={36} color="#8AD70E"/>
          <MapBlock rowStart={15} rowEnd={17} colStart={34} colEnd={35} color="#66CC00"/>
          <MapBlock rowStart={15} rowEnd={17} colStart={35} colEnd={36} color="#319900"/>

          <MapBlock rowStart={5} rowEnd={19} colStart={5} colEnd={16} color="#90EE90"/>
        </div>

      </main>

      <div className="fixed bottom-5 left-5 flex items-center space-x-2 z-5">
        <ChatBox messages={data ?? []} />
      </div>
      {/*  
      <div className="flex flex-col w-screen h-screen overflow-hidden">
        {/* Header 
        <div className="header-auth flex justify-between items-center shadow-md p-[32] h-16 backdrop-blur-sm z-20">
          <VisitaLogo />
          <div className="flex-1 max-w-md mx-4">
            <SearchBar />
          </div>
          <AuthButton />
        </div>

        {/* Map Container 
        <div className="bg-white flex-1 relative">
          <MapComponent/>
        </div>

        {/* Community Chat 
        <div className="fixed bottom-5 left-5 flex items-center space-x-2 z-30">
          <ChatBox messages={data ?? []} />
        </div>
      </div>
      */}
    </MapSearchProvider>
  );
}