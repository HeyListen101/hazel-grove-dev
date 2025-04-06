"use client";

import React, { useState, useEffect, useRef } from 'react';

const Rectangles = () => {
  const [scale, setScale] = useState(1);
  const containerRef = useRef(null);
  const originalWidth = 2560;
  const originalHeight = 1440;
  const headerHeight = 60; // Reduced from 64 to 60 to match CSS change

  useEffect(() => {
    const calculateScale = () => {
      if (!containerRef.current) return;
  
      const container = containerRef.current as HTMLDivElement;
      const availableHeight = window.innerHeight - headerHeight;
      const availableWidth = container.offsetWidth;
      
      const widthScale = availableWidth / originalWidth;
      const heightScale = availableHeight / originalHeight;
      
      setScale(Math.min(widthScale, heightScale) * 1.08);
    };
  
    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, []);

  const styles: { [key: string]: React.CSSProperties } = {
    rectangle69: {
      position: 'absolute',
      width: '111px',
      height: '62px',
      left: '2399px',
      top: '913px',
      background: '#8AD70E',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle68: {
      position: 'absolute',
      width: '111px',
      height: '62px',
      left: '2399px',
      top: '975px',
      background: '#90EE90',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle67: {
      position: 'absolute',
      width: '111px',
      height: '63px',
      left: '2399px',
      top: '1037px',
      background: '#006600',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle66: {
      position: 'absolute',
      width: '111px',
      height: '64px',
      left: '2399px',
      top: '849px',
      background: '#F07474',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle65: {
      position: 'absolute',
      width: '111px',
      height: '62px',
      left: '2399px',
      top: '787px',
      background: '#319900',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle64: {
      position: 'absolute',
      width: '111px',
      height: '54px',
      left: '2399px',
      top: '663px',
      background: '#F07474',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle63: {
      position: 'absolute',
      width: '111px',
      height: '51px',
      left: '2399px',
      top: '612px',
      background: '#90EE90',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle62: {
      position: 'absolute',
      width: '111px',
      height: '53px',
      left: '2399px',
      top: '559px',
      background: '#8AD70E',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle61: {
      position: 'absolute',
      width: '111px',
      height: '51px',
      left: '2399px',
      top: '508px',
      background: '#66CC00',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle60: {
      position: 'absolute',
      width: '111px',
      height: '52px',
      left: '2399px',
      top: '456px',
      background: '#319900',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle59: {
      position: 'absolute',
      width: '111px',
      height: '51px',
      left: '2399px',
      top: '405px',
      background: '#006600',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle58: {
      position: 'absolute',
      width: '111px',
      height: '54px',
      left: '2399px',
      top: '351px',
      background: '#90EE90',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle57: {
      position: 'absolute',
      width: '111px',
      height: '51px',
      left: '2399px',
      top: '300px',
      background: '#F07474',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle56: {
      position: 'absolute',
      width: '67px',
      height: '51px',
      left: '2043px',
      top: '179px',
      background: '#F07474',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle55: {
      position: 'absolute',
      width: '66px',
      height: '51px',
      left: '2110px',
      top: '179px',
      background: '#319900',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle54: {
      position: 'absolute',
      width: '68px',
      height: '51px',
      left: '1975px',
      top: '179px',
      background: '#90EE90',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle53: {
      position: 'absolute',
      width: '68px',
      height: '51px',
      left: '1907px',
      top: '179px',
      background: '#8AD70E',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle52: {
      position: 'absolute',
      width: '66px',
      height: '51px',
      left: '1841px',
      top: '179px',
      background: '#66CC00',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle51: {
      position: 'absolute',
      width: '58px',
      height: '105px',
      left: '1556px',
      top: '179px',
      background: '#66CC00',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle50: {
      position: 'absolute',
      width: '213px',
      height: '640px',
      left: '1170px',
      top: '439px',
      background: '#006600',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle49: {
      position: 'absolute',
      width: '169px',
      height: '84px',
      left: '2065px',
      top: '787px',
      background: '#8AD70E',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle48: {
      position: 'absolute',
      width: '86px',
      height: '162px',
      left: '2065px',
      top: '871px',
      background: '#66CC00',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle47: {
      position: 'absolute',
      width: '83px',
      height: '162px',
      left: '2150px',
      top: '871px',
      background: '#F07474',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle46: {
      position: 'absolute',
      width: '565px',
      height: '587px',
      left: '1446px',
      top: '439px',
      background: '#90EE90',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle45: {
      position: 'absolute',
      width: '55px',
      height: '105px',
      left: '1501px',
      top: '179px',
      background: '#F07474',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle44: {
      position: 'absolute',
      width: '55px',
      height: '51px',
      left: '1446px',
      top: '179px',
      background: '#F07474',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle43: {
      position: 'absolute',
      width: '58px',
      height: '51px',
      left: '1388px',
      top: '179px',
      background: '#90EE90',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle42: {
      position: 'absolute',
      width: '56px',
      height: '51px',
      left: '1332px',
      top: '179px',
      background: '#F07474',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle41: {
      position: 'absolute',
      width: '59px',
      height: '51px',
      left: '1273px',
      top: '179px',
      background: '#66CC00',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle40: {
      position: 'absolute',
      width: '56px',
      height: '51px',
      left: '1217px',
      top: '179px',
      background: '#319900',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle39: {
      position: 'absolute',
      width: '56px',
      height: '53px',
      left: '1159px',
      top: '179px',
      background: '#006600',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle38: {
      position: 'absolute',
      width: '113px',
      height: '105px',
      left: '942px',
      top: '179px',
      background: '#66CC00',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle37: {
      position: 'absolute',
      width: '55px',
      height: '1192px',
      left: '1079px',
      top: '179px',
      background: 'linear-gradient(180deg, #FFFFFF 0%, #D6D8D9 5%, #D6D8D9 95%, #FFFFFF 100%)',
    },
    rectangle36: {
      position: 'absolute',
      width: '23px',
      height: '469px',
      left: '2027px',
      top: '787px',
      background: 'rgba(153, 157, 160, 0.4)',
      borderRadius: '25px 25px 0px 0px',
    },
    rectangle35: {
      position: 'absolute',
      width: '24px',
      height: '817px',
      left: '1395px',
      top: '439px',
      background: 'rgba(153, 157, 160, 0.4)',
      borderRadius: '25px 25px 0px 0px',
    },
    rectangle34: {
      position: 'absolute',
      width: '23px',
      height: '278px',
      left: '2246px',
      top: '787px',
      background: 'rgba(153, 157, 160, 0.4)',
      borderRadius: '25px 25px 0px 0px',
    },
    rectangle33: {
      position: 'absolute',
      width: '1212px',
      height: '54px',
      left: '1134px',
      top: '333px',
      background: 'rgba(153, 157, 160, 0.4)',
      borderRadius: '0px 18px 0px 0px',
    },
    rectangle32: {
      position: 'absolute',
      width: '608px',
      height: '21px',
      left: '1419px',
      top: '1044px',
      background: 'rgba(153, 157, 160, 0.4)',
      borderRadius: '0px',
    },
    rectangle31: {
      position: 'absolute',
      width: '196px',
      height: '21px',
      left: '2050px',
      top: '1044px',
      background: 'rgba(153, 157, 160, 0.4)',
      borderRadius: '0px',
    },
    rectangle30: {
      position: 'absolute',
      width: '608px',
      height: '22px',
      left: '1419px',
      top: '1234px',
      background: 'rgba(153, 157, 160, 0.4)',
      borderRadius: '0px',
    },
    rectangle29: {
      position: 'absolute',
      width: '59px',
      height: '986px',
      left: '2287px',
      top: '385px',
      background: 'linear-gradient(180deg, #D6D8D9 94.51%, #FFFFFF 100%)',
      borderRadius: '0px',
    },
    rectangle28: {
      position: 'absolute',
      width: '79px',
      height: '70px',
      left: '1446px',
      top: '1079px',
      background: '#319900',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle27: {
      position: 'absolute',
      width: '79px',
      height: '73px',
      left: '1446px',
      top: '1149px',
      background: '#66CC00',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle26: {
      position: 'absolute',
      width: '78px',
      height: '73px',
      left: '1525px',
      top: '1149px',
      background: '#8AD70E',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle25: {
      position: 'absolute',
      width: '81px',
      height: '73px',
      left: '1603px',
      top: '1149px',
      background: '#90EE90',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle24: {
      position: 'absolute',
      width: '81px',
      height: '73px',
      left: '1684px',
      top: '1149px',
      background: '#006600',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle23: {
      position: 'absolute',
      width: '80px',
      height: '73px',
      left: '1765px',
      top: '1149px',
      background: '#319900',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle22: {
      position: 'absolute',
      width: '80px',
      height: '73px',
      left: '1841px',
      top: '1149px',
      background: '#F07474',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle21: {
      position: 'absolute',
      width: '81px',
      height: '73px',
      left: '1921px',
      top: '1149px',
      background: '#F07474',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle20: {
      position: 'absolute',
      width: '78px',
      height: '72px',
      left: '1525px',
      top: '1077px',
      background: '#66CC00',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle19: {
      position: 'absolute',
      width: '81px',
      height: '70px',
      left: '1603px',
      top: '1079px',
      background: '#8AD70E',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle18: {
      position: 'absolute',
      width: '76px',
      height: '72px',
      left: '1765px',
      top: '1077px',
      background: '#F07474',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle17: {
      position: 'absolute',
      width: '161px',
      height: '70px',
      left: '1841px',
      top: '1079px',
      background: '#319900',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle16: {
      position: 'absolute',
      width: '81px',
      height: '70px',
      left: '1684px',
      top: '1079px',
      background: '#90EE90',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle15: {
      position: 'absolute',
      width: '185px',
      height: '105px',
      left: '757px',
      top: '179px',
      background: '#319900',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle14: {
      position: 'absolute',
      width: '79px',
      height: '105px',
      left: '679px',
      top: '179px',
      background: '#006600',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle13: {
      position: 'absolute',
      width: '80px',
      height: '105px',
      left: '599px',
      top: '179px',
      background: '#90EE90',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle12: {
      position: 'absolute',
      width: '115px',
      height: '105px',
      left: '484px',
      top: '179px',
      background: '#8AD70E',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle11: {
      position: 'absolute',
      width: '110px',
      height: '105px',
      left: '371px',
      top: '179px',
      background: '#F07474',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle10: {
      position: 'absolute',
      width: '112px',
      height: '105px',
      left: '257px',
      top: '179px',
      background: '#319900',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle9: {
      position: 'absolute',
      width: '113px',
      height: '51px',
      left: '140px',
      top: '179px',
      background: '#006600',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle8: {
      position: 'absolute',
      width: '55px',
      height: '158px',
      left: '50px',
      top: '230px',
      background: '#90EE90',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle7: {
      position: 'absolute',
      width: '57px',
      height: '104px',
      left: '1784px',
      top: '178px',
      background: '#319900',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle6: {
      position: 'absolute',
      width: '56px',
      height: '105px',
      left: '1728px',
      top: '179px',
      background: '#006600',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle5: {
      position: 'absolute',
      width: '56px',
      height: '105px',
      left: '1672px',
      top: '179px',
      background: '#90EE90',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle4: {
      position: 'absolute',
      width: '58px',
      height: '105px',
      left: '1614px',
      top: '179px',
      background: '#8AD70E',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle3: {
      position: 'absolute',
      width: '250px',
      height: '105px',
      left: '2179px',
      top: '179px',
      background: '#66CC00',
      borderRadius: '5px',
    },
    rectangle2: {
      position: 'absolute',
      width: '938px',
      height: '16px',
      left: '141px',
      top: '299px',
      background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.4) 0%, rgba(153, 157, 160, 0.4) 10%)',
      borderRadius: '0px',
    },
    rectangle1: {
      position: 'absolute',
      width: '709px',
      height: '891px',
      left: '217px',
      top: '406px',
      background: 'rgba(0, 0, 0, 0.4)',
      borderRadius: '9px',
    },
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: `${originalWidth}px`,
          height: `${originalHeight}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'center top',
          left: '50%',
          marginLeft: `-${originalWidth / 2}px`,
          top: '-0.5rem', // Added slight top position to compensate
        }}
      >
        <div style={styles.rectangle69}></div>
        <div style={styles.rectangle68}></div>
        <div style={styles.rectangle67}></div>
        <div style={styles.rectangle66}></div>
        <div style={styles.rectangle65}></div>
        <div style={styles.rectangle64}></div>
        <div style={styles.rectangle63}></div>
        <div style={styles.rectangle62}></div>
        <div style={styles.rectangle61}></div>
        <div style={styles.rectangle60}></div>
        <div style={styles.rectangle59}></div>
        <div style={styles.rectangle58}></div>
        <div style={styles.rectangle57}></div>
        <div style={styles.rectangle56}></div>
        <div style={styles.rectangle55}></div>
        <div style={styles.rectangle54}></div>
        <div style={styles.rectangle53}></div>
        <div style={styles.rectangle52}></div>
        <div style={styles.rectangle51}></div>
        <div style={styles.rectangle50}></div>
        <div style={styles.rectangle49}></div>
        <div style={styles.rectangle48}></div>
        <div style={styles.rectangle47}></div>
        <div style={styles.rectangle46}></div>
        <div style={styles.rectangle45}></div>
        <div style={styles.rectangle44}></div>
        <div style={styles.rectangle43}></div>
        <div style={styles.rectangle42}></div>
        <div style={styles.rectangle41}></div>
        <div style={styles.rectangle40}></div>
        <div style={styles.rectangle39}></div>
        <div style={styles.rectangle38}></div>
        <div style={styles.rectangle37}></div>
        <div style={styles.rectangle36}></div>
        <div style={styles.rectangle35}></div>
        <div style={styles.rectangle34}></div>
        <div style={styles.rectangle33}></div>
        <div style={styles.rectangle32}></div>
        <div style={styles.rectangle31}></div>
        <div style={styles.rectangle30}></div>
        <div style={styles.rectangle29}></div>
        <div style={styles.rectangle28}></div>
        <div style={styles.rectangle27}></div>
        <div style={styles.rectangle26}></div>
        <div style={styles.rectangle25}></div>
        <div style={styles.rectangle24}></div>
        <div style={styles.rectangle23}></div>
        <div style={styles.rectangle22}></div>
        <div style={styles.rectangle21}></div>
        <div style={styles.rectangle20}></div>
        <div style={styles.rectangle19}></div>
        <div style={styles.rectangle18}></div>
        <div style={styles.rectangle17}></div>
        <div style={styles.rectangle16}></div>
        <div style={styles.rectangle15}></div>
        <div style={styles.rectangle14}></div>
        <div style={styles.rectangle13}></div>
        <div style={styles.rectangle12}></div>
        <div style={styles.rectangle11}></div>
        <div style={styles.rectangle10}></div>
        <div style={styles.rectangle9}></div>
        <div style={styles.rectangle8}></div>
        <div style={styles.rectangle7}></div>
        <div style={styles.rectangle6}></div>
        <div style={styles.rectangle5}></div>
        <div style={styles.rectangle4}></div>
        <div style={styles.rectangle3}></div>
        <div style={styles.rectangle2}></div>
        <div style={styles.rectangle1}></div>
      </div>
    </div>
  );
};

export default Rectangles;
