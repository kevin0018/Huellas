import NavBar from "../Components/NavBar";
import Footer from "../Components/footer";
import GoBackButton from "../Components/GoBackButton";

type AnuncioCardProps = {
  title: string;
  author: string;
  description: string;
  imageUrl: string;
};

function AnuncioCard({ title, author, description, imageUrl }: AnuncioCardProps) {



  return (
    <div className="bg-[#FDF2DE] border-2 border-[#BCAAA4] rounded-2xl p-4 flex flex-col shadow-lg transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl">

      <div className="flex items-center gap-3 bg-[#BCAAA4] p-2 rounded-lg">
        <div className="bg-white rounded-full p-1">
          <img src={imageUrl} alt="Icono del anuncio" className="w-8 h-8" />
        </div>
        <h3 className=" text-white text-lg">{title}</h3>
      </div>

      <p className="mt-4 text-left font-semibold text-[#51344D]">{author}</p>

      <div className="mt-2 p-3 w-full h-40 bg-white border border-gray-300 rounded-lg">
        <p className="text-gray-600 text-left">{description}</p>
      </div>
    </div>
  );
}


// --- Componente principal de la página ---
function VolunteerBoard() {
  return (
    <>
      <NavBar />
      <div className="flex flex-col items-center justify-center background-primary px-4 py-8" style={{ minHeight: 'calc(100vh - 180px)' }}>
        <div className="fixed inset-0 z-0 w-full h-full bg-repeat bg-[url('/media/bg_phone_userhome.png')] opacity-60 pointer-events-none" aria-hidden="true" />

        <div className="relative z-10 w-full max-w-6xl">
          {/* Go back */}
          <div className="w-full text-left mx-auto mt-8">
            <GoBackButton variant="outline" hideIfNoHistory className="bg-white" />
          </div>
          <h1 className="h1 font-caprasimo mb-2 text-5xl text-[#51344D] drop-shadow-lg text-center">
            Tablón de anuncios
          </h1>
          <p className="text-center text-lg text-[#51344D]/80 mb-10">
            Aquí puedes buscar entre los voluntarios más cercanos a ti.
          </p>

          {/* Grid para las tarjetas de anuncios */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

            <AnuncioCard
              title="Nombre del anuncio"
              author="Autor del anuncio"
              description="Información del anuncio (solo una pequeña preview de varias líneas como máximo)..."
              imageUrl="/media/pfp_sample.svg"
            />

            <AnuncioCard
              title="Nombre del anuncio"
              author="Autor del anuncio"
              description="Información del anuncio (solo una pequeña preview de varias líneas como máximo)..."
              imageUrl="/media/pfp_sample.svg"
            />

            <AnuncioCard
              title="Nombre del anuncio"
              author="Autor del anuncio"
              description="Información del anuncio (solo una pequeña preview de varias líneas como máximo)..."
              imageUrl="/media/pfp_sample.svg"
            />

          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default VolunteerBoard;