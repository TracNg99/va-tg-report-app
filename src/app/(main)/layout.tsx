import Footer from '@/components/layouts/footer';
import Navbar from '@/components/layouts/navbar';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
};

export default MainLayout;
