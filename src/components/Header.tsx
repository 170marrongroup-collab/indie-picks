import Link from 'next/link';
export function Header(){return <header className="header"><div className="wrap headerInner"><Link className="brand" href="/">INDIE PICKS <span>BETA</span></Link><nav><Link href="/ranking">ランキング</Link><Link href="/new">新着</Link><Link href="/genres">ジャンル</Link><Link href="/creators">クリエイター</Link></nav></div></header>}
