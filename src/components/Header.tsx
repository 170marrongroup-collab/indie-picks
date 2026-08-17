import Link from "next/link";

export function Header() {
  return (
    <header className="header">
      <div className="wrap headerInner">
        <Link className="brand" href="/" aria-label="H-IT H-ITEM TREND ホーム">
          <span className="brandMark">H-IT</span>
          <span className="brandText">
            <b>H-ITEM TREND</b>
            <small>えっちいっと</small>
          </span>
        </Link>
        <nav>
          <Link href="/ranking">ランキング</Link>
          <Link href="/new">新着</Link>
          <Link href="/genres">ジャンル</Link>
          <Link href="/creators">クリエイター</Link>
        </nav>
      </div>
    </header>
  );
}
