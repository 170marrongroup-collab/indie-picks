export type Work = { slug:string; title:string; creator:string; tag:string; score:number; price:string; note:string };
export const works: Work[] = [
  { slug:'sample-a', title:'注目の個人作品 A', creator:'Creator A', tag:'新着', score:94, price:'¥1,980', note:'新着度・注目度が高い作品' },
  { slug:'sample-b', title:'話題の個人作品 B', creator:'Creator B', tag:'急上昇', score:91, price:'¥1,480', note:'最近クリックが伸びている作品' },
  { slug:'sample-c', title:'編集部ピック C', creator:'Creator C', tag:'おすすめ', score:88, price:'¥980', note:'価格とのバランスが良い作品' },
  { slug:'sample-d', title:'新規クリエイター D', creator:'Creator D', tag:'発見', score:86, price:'¥1,280', note:'今後追いかけたい新規クリエイター' }
];
