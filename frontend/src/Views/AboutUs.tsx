import React from 'react';
import { useTranslation } from '../i18n/hooks/hook';
import NavBar from '../Components/NavBar';
import Footer from '../Components/footer';

const AboutUs: React.FC = () => {
  const { translate } = useTranslation();

  return (
    <>
      <NavBar />
      <article className="flex flex-col items-center justify-center min-h-screen background-primary text-justify">

        <h1 className="h1 mt-8 mb-15 ">{translate('aboutUs')}</h1>

        <section className="mt-5">
          <h2 className="h2 mb-3">{translate('ourMission')}</h2>
          <div className="flex flex-col gap-10 md:flex-row md:justify-between items-center max-w-5xl mx-auto">
            <img src="/media/AboutUs/SkateDog.png" alt="" className="items-center justify-center w-50 md:w-80 mx-auto m-3"/>
            <p className="w-85 md:w-full md:max-w-7xl">{translate('ourMissionText')}</p>
          </div>
        </section>

        <section className="mt-5">
          <h2 className="h2 mb-4">{translate('ourVision')}</h2>
          <div className="flex flex-col md:flex-row-reverse md:justify-between items-center max-w-7xl mx-auto">
            <img src="/media/AboutUs/allPets.png" alt="" className="items-center justify-center w-80 mx-auto m-6 md:m-0"/>
            <p className="w-85 md:w-full md:max-w-2xl">{translate('ourVisionText')}</p>
          </div>
        </section>

        <section className="mt-5 mb-15">
          <h2 className="h2 mb-4">{translate('meetTheTeam')}</h2>
          <div className="flex flex-col md:flex-row-reverse md:justify-between items-center max-w-7xl mx-auto gap-20 mt-15">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div >
                <img src="/media/AboutUs/dalmata.png" alt="" className="items-center justify-center w-30 h-30 mx-auto mb-2"/>
                <p className="text-center">Kevin Hernandez</p>
                <p>Desarrollador Full-Stack</p>
              </div>
              <div>
                <img src="/media/AboutUs/labrador.png" alt="" className="items-center justify-center w-30 h-30 mx-auto mb-2"/>
                <p className="text-center">Adriana Elias</p>
                <p>Desarrolladora Full-Stack</p>
              </div>
              <div>
                <img src="/media/AboutUs/chihuahua.png" alt="" className="items-center justify-center w-30 h-30 mx-auto mb-2"/>
                <p className="text-center">Aroa Granja</p>
                <p>Desarrolladora Full-Stack</p>
              </div>
              <div>
                <img src="/media/AboutUs/galgo.png" alt="" className="items-center justify-center w-30 h-30 mx-auto mb-2"/>
                <p className="text-center">Fernanda Montalvan</p>
                <p>Desarrolladora Full-Stack</p>
              </div>
            </div>
            <div className="flex-row">
              <p className="w-85 md:w-full md:max-w-xl">{translate('meetTheTeamText')}</p>
              <p className="w-85 md:w-full md:max-w-xl">{translate('meetTheTeamText2')}</p>
            </div>
          </div>
        </section>
      </article>
      <Footer />
    </>
  );
};

export default AboutUs;
