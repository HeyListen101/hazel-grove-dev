import BackgroundImage from '@/components/assets/background-images/Background.png';
import { motion } from "motion/react"

export default function VisitaPlaceholder() {
  return (
    <motion.div 
      className="w-full h-full aspect-[40/20] bg-cover bg-center rounded-[15px] flex flex-col items-center justify-center text-center relative p-[50px]"
      style={{
        background: `url(${BackgroundImage.src})`,
        backgroundSize: "100% 100%",
        gridRowStart: 5,
        gridRowEnd: 20,
        gridColumnStart: 5,
        gridColumnEnd: 16,
      }}
      initial={{ opacity: 0, y: 0, x: -10 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: 0, x: 10}}
      transition={{ duration: 0.35, ease: "easeInOut" }}
    >
      <h1 className="absolute top-16 w-full h-full text-4xl md:text-5xl lg:text-6xl font-bold">
        Welcome<br/>
        to<br/>
        Visita
      </h1>
      <h1 className="absolute  bottom-10 text-[12px] lg:text-lg">
        Try <span className="font-bold">clicking </span>
        one of the store boxes!<br/>
        <span className="font-bold text-[#F07474]">Red </span>
        boxes means
        <span className="font-bold text-[#F07474]"> closed</span>.
      </h1>
    </motion.div>
  );  
}