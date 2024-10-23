"use client"

import { useEffect, useState } from "react";
import Head from 'next/head';

export default function Home() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true)
  }, [])
  if(!hydrated) {
    return null
  }

  function btnClick() {
    window.location.href = '/chat'
  }

  const observe = (element) => {
    if (!element) {
        return;
    }

    observer.observe(element);
    };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const { target, isIntersecting } = entry;

            if (isIntersecting) {
                target.classList.add("item--show");
                return;
            }

            target.classList.remove("item--show");
        });
    })
  return (
    <div className="container">
      <img></img>
      <Head>
        <title>Psychotherapy</title>
        <meta name="description" content="Psychotherapy - IMAE DFD Team" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="main">
        <div className="TitleCxt">
          <h1 className='title'>PSYCHOTHERAPY</h1>
          <div className="subtitle">IMAE DFD TEAM</div>
          <img className='Circle1' src="/Subtract.png"></img>
          <div className='Circle'></div>
          <div className='Circle f'></div>
          <div className='Circle s'></div>
          <button className="button" onClick={btnClick.bind(this)}>
            <div className="rect1">▶</div>
            <div style={{margin:"0 10px 0 10px"}}>AI 상담하기</div>
            <div className="rect1">◀︎</div>
          </button>
        </div>
      </main>
      <div ref={observe} className='firstSub show'>
        <div className='infoTxt1'>당신의 감정을<br />깊숙히 살펴보아요!</div>
        <img className='img1' src='/img1.png'></img>
      </div>
      <div ref={observe} className='firstSub show'>
        <img className='img1 left' src='/Union.png'></img>
        <div className='infoTxt1 left'>혼란한 사회 속<br />하나의 안식처가 되어줄 곳.</div>
      </div>
      <div ref={observe} className='firstSub center show'>
        <img className='img1 center' src='/img2.png'></img>
        <div className='infoTxt1 center'>당신의 감정을<br />자유롭게 털어놓아요!</div>
      </div>
      <div className='firstSub center small'>
        <button className="button bott" onClick={btnClick.bind(this)}>
            <div className="rect1">▶</div>
            <div style={{margin:"0 10px 0 10px"}}>AI 상담하기</div>
            <div className="rect1">◀︎</div>
        </button>
      </div>
      <div className='foot'>© 2024 2-9 DFD Team. All rights reserved.</div>
    </div>
  )
}
