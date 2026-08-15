import {WorkCard} from '@/components/WorkCard'; import {works} from '@/lib/mock';
export default function Page(){return <main className="wrap page"><p className="kicker">INDIE PICKS</p><h1>new</h1><p className="lead">Supabase / API接続後に実データへ切り替える初期ページです。</p><div className="grid">{works.map((w,i)=><WorkCard key={w.slug} work={w} rank={i+1}/>)}</div></main>}
