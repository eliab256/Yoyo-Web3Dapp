import Header from './components/layout/Header';
import Gallery from './components/layout/Gallery';
import CurrentAuction from './components/layout/CurrentAuction';
import MyNfts from './components/layout/MyNfts';
import AboutUs from './components/layout/AboutUs';
import Footer from './components/layout/Footer';
import { useSelector } from 'react-redux';
import { selectCurrentPage } from './redux/pagesSlice';

function App() {
    const currentOpenPage = useSelector(selectCurrentPage);

    const pageComponents = {
        gallery: <Gallery />,
        currentAuction: <CurrentAuction />,
        myNfts: <MyNfts />,
        aboutUs: <AboutUs />,
    };

    return (
        <div className="flex flex-col h-full w-full">
            <Header />
            <main className="relative w-full flex-1">{pageComponents[currentOpenPage]}</main>
            <Footer />
        </div>
    );
}

export default App;
