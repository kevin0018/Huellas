import React from 'react';
import { useTranslation } from '../i18n/hooks/hook';
import NavBar from '../Components/NavBar';
import Footer from '../Components/footer';

const Procedures: React.FC = () => {
    const { translate } = useTranslation();

    return (
        <div className="w-full max-auto bg-[url(/media/bg_desktop_userhome.png)]">
            <NavBar />
            <h1 className="h1 m-6">{translate('procedures')}</h1>

            <section className="flex items-center justify-center">
                <div className="bg-[#FDF2DE] border-1 border-[#BCAAA4] text-start rounded-xl grid grid-cols-1 gap-8 m-4 p-4 md:grid-cols-2 lg:grid-cols-3 lg:max-w-5xl">
                    <div>
                        <p className="bg-[#c7b9bb] px-2 py-1 mb-3">0 - 2 {translate('weeks')}</p>
                        <label className="flex items-center">
                            <input type="checkbox" name={translate('innerdes')} title={translate('innerdes')} className="mr-2 h-4 w-4"/>
                            {translate('innerdes')}
                        </label>
                        <p className="mt-3 p-2 rounded-md bg-white border-[#BCAAA4] border-1">{translate('innerdestext')}</p>
                    </div>
                    <div >
                        <p className="bg-[#c7b9bb] px-2 py-1 mb-3">2 - 6 {translate('weeks')}</p>
                        <label className="flex items-center">
                            <input type="checkbox" name={translate('extdes')} title={translate('extdes')} className="mr-2 h-4 w-4"/>
                            {translate('extdes')}
                        </label>
                        <p className="mt-3 p-2 rounded-md bg-white border-[#BCAAA4] border-1">{translate('extdestext')}</p>
                    </div>
                    <div >
                        <p className="bg-[#c7b9bb] px-2 py-1 mb-3">6 - 8 {translate('weeks')}</p>
                        <label className="flex items-center">
                            <input type="checkbox" name={translate('multivac')} title={translate('multivac')} className="mr-2 h-4 w-4"/>
                            {`${translate('multivac')} (1º ${translate('dose')})`}
                        </label>
                        <p className="mt-3 p-2 rounded-md bg-white border-[#BCAAA4] border-1">{translate('vaccines1')}</p>
                    </div>
                    <div >
                        <p className="bg-[#c7b9bb] px-2 py-1 mb-3">8 -  10 {translate('weeks')}</p>
                        <label className="flex items-center">
                            <input type="checkbox" name={translate('kennelvac')} title={translate('kennelvac')} className="mr-2 h-4 w-4"/>
                            {translate('kennelvac')}
                        </label>
                        <p className="mt-3 p-2 rounded-md bg-white border-[#BCAAA4] border-1">{translate('vaccines2')}</p>
                    </div>
                    <div >
                        <p className="bg-[#c7b9bb] px-2 py-1 mb-3">10 {translate('weeks')}</p>
                        <label className="flex items-center">
                            <input type="checkbox" name={translate('multivac')} title={translate('multivac')} className="mr-2 h-4 w-4"/>
                            {`${translate('multivac')} (2º ${translate('dose')})`}
                        </label>
                        <p className="mt-3 p-2 rounded-md bg-white border-[#BCAAA4] border-1">{translate('reinforceMulti')}</p>
                    </div>
                    <div >
                        <p className="bg-[#c7b9bb] px-2 py-1 mb-3">12 {translate('weeks')}</p>
                        <label className="flex items-center">
                            <input type="checkbox" name={translate('rabidVac')} title={translate('rabidVac')} className="mr-2 h-4 w-4"/>
                            {translate('rabidVac')}
                        </label>
                        <p className="mt-3 p-2 rounded-md bg-white border-[#BCAAA4] border-1">{translate('rabidText')}</p>
                    </div>
                    <div >
                        <p className="bg-[#c7b9bb] px-2 py-1 mb-3">16 {translate('weeks')}</p>
                        <label className="flex items-center">
                            <input type="checkbox" name={translate('multivac')} title={translate('multivac')} className="mr-2 h-4 w-4"/>
                            {`${translate('multivac')} (3º ${translate('dose')})`}
                        </label>
                        <p className="mt-3 p-2 rounded-md bg-white border-[#BCAAA4] border-1">{translate('lastMultiText')}</p>
                    </div>
                </div>
            </section>
            <Footer />
        </div>
    );
};

export default Procedures;
