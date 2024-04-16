import AcmeLogo from '@/app/ui/acme-logo';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import styles from '@/app/ui/home.module.css'
import { lusitana } from '@/app/ui/fonts';
import Image from 'next/image';

export default function Page() {
  return (
    <main className='flex place-content-center'>
      <nav className="container mx-auto flex ">
        <div>首页</div>
        <div className='flex'>
          <div>1</div>
          <div>2</div>
          <div>3</div>
          <div>4</div>
        </div>
      </nav>
      {/* <div>111</div> */}
    </main>
  );
}
