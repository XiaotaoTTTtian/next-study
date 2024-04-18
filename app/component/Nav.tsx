import Link from 'next/link';

export default function Nav() {

  return (<nav className="fixed top-0 left-auto z-10 opacity-75  bg-[#fff] h-12  rounded-md w-screen flex justify-center">
    <div className='flex justify-between items-center w-9/12'>
      <Link href='/' className='font-bold text-[#96cb4b] mx-10 cursor-pointer'>首页</Link>
      <div className='flex justify-evenly'>
        <div className='px-10 cursor-pointer'>文章</div>
        <div className='px-10 cursor-pointer'>生活</div>
        <div className='px-10 cursor-pointer'>留言板</div>
        <div className='px-10 cursor-pointer'>github</div>
      </div>
    </div>
</nav>)
}