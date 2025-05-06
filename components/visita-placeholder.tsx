import BackgroundImage from '@/components/assets/background-images/Background.png';
import { motion } from "motion/react"

export default function VisitaPlaceholder() {
  return (
    <motion.div 
      className="row-start-[5] row-end-[19] col-start-[5] col-end-[16] w-full h-full bg-cover bg-center rounded-[15px] flex flex-col justify-between items-center py-[50px] px-[25px] text-center"
      style={{
        background: `url(${BackgroundImage.src})`,
        backgroundSize: "100% 100%",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="text-5xl font-bold">
        Welcome<br/>
        to<br/>
        Visita
      </h1>
      <h1>
        Try <span className="font-bold">clicking </span>
        one of the store boxes!<br/>
        <span className="font-bold text-[#F07474]">Red </span>
        boxes means
        <span className="font-bold text-[#F07474]">closed</span>.
      </h1>
    </motion.div>
  );
}