import BackgroundImage from '@/components/assets/background-images/Background.png';
import { motion } from "motion/react"

export default function VisitaPlaceholder() {
  return (
    <motion.div 
      className="w-full h-full aspect-[40/20] bg-cover bg-center rounded-[15px] flex flex-col justify-between items-center py-[50px] px-[25px] text-center"
      style={{
        background: `url(${BackgroundImage.src})`,
        backgroundSize: "100% 100%",
        gridRowStart: 5,
        gridRowEnd: 20,
        gridColumnStart: 5,
        gridColumnEnd: 16,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="w-full h-full aspect-[40/20] text-7xl font-bold">
        Welcome<br/>
        to<br/>
        Visita
      </h1>
      <h1 className="text-m">
        Try <span className="font-bold">clicking </span>
        one of the store boxes!<br/>
        <span className="font-bold text-[#F07474]">Red </span>
        boxes means
        <span className="font-bold text-[#F07474]"> closed</span>.
      </h1>
    </motion.div>
  );
}