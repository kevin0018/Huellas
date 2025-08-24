import React from 'react';
import { useTranslation } from '../i18n/hooks/hook';
import NavBar from '../Components/NavBar';
import Footer from '../Components/footer';

const AboutUs: React.FC = () => {
  const { translate } = useTranslation();

  return (
    <>
      <NavBar />
      <article className="flex flex-col items-center justify-center min-h-screen background-primary text-justify ">

        <h1 className="h1 mt-8 mb-15 ">{translate('aboutUs')}</h1>

        <section className="mt-5 md:max-w-[90%]">
          <h2 className="h2 mb-3">{translate('ourMission')}</h2>
          <div className="flex flex-col gap-10 md:flex-row md:justify-between items-center max-w-5xl mx-auto aboutUsDiv">
            <img src="/media/AboutUs/SkateDog.png" alt="" className="items-center justify-center w-50 md:w-80 mx-auto m-3" />
            <p className="w-85 md:w-full md:max-w-7xl">{translate('ourMissionText')}</p>
          </div>
        </section>

        <section className="mt-5 md:max-w-[90%]">
          <h2 className="h2 mb-4">{translate('ourVision')}</h2>
          <div className="flex flex-col md:flex-row-reverse md:justify-between items-center max-w-7xl mx-auto aboutUsDiv">
            <img src="/media/AboutUs/allPets.png" alt="" className="items-center justify-center w-80 mx-auto m-6 md:m-0" />
            <p className="w-85 md:w-full md:max-w-2xl 3xl:max-w-[70%]">{translate('ourVisionText')}</p>
          </div>
        </section>

        <section className="mt-16 mb-16 md:max-w-[80%]">
          <h2 className="h2 mb-4">{translate('meetTheTeam')}</h2>

          <div className="aboutUsDiv mx-auto max-w-7xl px-4 flex flex-col md:flex-row-reverse md:items-start gap-10 md:gap-16 mt-16 3xl:p-0">
            {/* PEOPLE GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:basis-1/2 3xl:gap-5">
              <div className="text-center">
                <img src="/media/AboutUs/dalmata.png" alt="" className="mx-auto mb-2 size-[120px] md:size-[140px]" />
                <p className="font-semibold">Kevin Hernandez</p>
                <p className="text-sm md:text-base">Desarrollador Full-Stack</p>
              </div>
              <div className="text-center">
                <img src="/media/AboutUs/labrador.png" alt="" className="mx-auto mb-2 size-[120px] md:size-[140px]" />
                <p className="font-semibold">Adriana Elias</p>
                <p className="text-sm md:text-base">Desarrolladora Full-Stack</p>
              </div>
              <div className="text-center">
                <img src="/media/AboutUs/chihuahua.png" alt="" className="mx-auto mb-2 size-[120px] md:size-[140px]" />
                <p className="font-semibold">Aroa Granja</p>
                <p className="text-sm md:text-base">Desarrolladora Full-Stack</p>
              </div>
              <div className="text-center">
                <img src="/media/AboutUs/galgo.png" alt="" className="mx-auto mb-2 size-[120px] md:size-[140px]" />
                <p className="font-semibold">Fernanda Montalvan</p>
                <p className="text-sm md:text-base">Desarrolladora Full-Stack</p>
              </div>
            </div>

            {/* COPY */}
            <div className="md:basis-1/2 my-auto">
              <div className="text-pretty">
                <p>{translate('meetTheTeamText')}</p>
                <p>{translate('meetTheTeamText2')}</p>
              </div>
            </div>
          </div>
        </section>

      </article>
      <Footer />
    </>
  );
};

export default AboutUs;
