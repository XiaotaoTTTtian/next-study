

import { getArticleContent } from "@/app/lib/data";
import { Marked } from 'marked';
import './style.css'
import { markedHighlight } from "marked-highlight";
import hljs from 'highlight.js';
import ToTop from "@/app/component/ToTop";
import Nav from "@/app/component/Nav";

export default async function Page ({ params }: { params: { id: string } }) {
  const res = await getArticleContent({
    id: Number(params.id)
  })
  
  function maskFileTransform(data: any) {
    const marked = new Marked(
      markedHighlight({
        highlight(code) {
          return hljs.highlightAuto(code).value
        }
      })
    )
    return marked.parse(data)
  }
  return (<div className="w-svw article ">
    <Nav />
    <div className="w-full flex justify-center">
      <div dangerouslySetInnerHTML={{__html: maskFileTransform(res.content)}} className='pt-16 w-9/12 px-10 bg-[#fff]'></div>
    </div>
    <ToTop />
  </div>)
}