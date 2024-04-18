import Link from 'next/link';
import dayjs from 'dayjs'

interface Props {
  item: {
    title: string;
    summary: string;
    date: any,
    article_id: number
  }
}

export default function ArticleTitle (props: Props) {
  return (
    <Link href={`/article/${props.item.article_id}/read`}>
      <div className="my-5 border-b border-solid outline-1 border-slate-300 mx-1.5">
        <div className="text-xl font-bold"> { props.item.title } </div>
        <div className="text-sm">{ dayjs(props.item.date).format('YYYY-MM-DD') }</div>
        <div className="text-base">{ props.item.summary }</div>
    </div>
    </Link>
  )
}