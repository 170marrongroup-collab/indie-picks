import type {Metadata} from 'next'; import './globals.css'; import {Header} from '@/components/Header';
export const metadata:Metadata={title:'INDIE PICKS | 個人・同人作品の発見メディア',description:'個人・同人作品をランキング、新着、ジャンル、クリエイターから探せる発見メディア。'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ja"><body><Header/>{children}<footer><div className="wrap">18歳以上向けコンテンツを扱う予定のメディアです。掲載・広告表記・権利処理は各サービス規約に準拠して運営します。<br/>© 2026 INDIE PICKS</div></footer></body></html>}
