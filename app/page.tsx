import ArticleTitle from './component/articleTitle';
import { fetchArticleList } from './lib/data';
import Nav from './component/Nav';


export default async function Page() {
  const list = await fetchArticleList()
  return (
    <main className='w-screen'>
      <Nav />
      <div className='h-full flex justify-center pt-12'>
        <div className='w-9/12 bg-[#fff]'>
          {
            list.map((item: any) => <ArticleTitle item={item} />)
          }
        </div>
      </div>
    </main>
  );
}
