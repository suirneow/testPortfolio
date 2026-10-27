// 各セクションの index.json を自動生成する(GitHub Actions から実行)
const fs=require('fs'),path=require('path');
const SECTIONS={work:'.json',writing:'.md',log:'.md'};
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
for(const root of ['content','demo']){
  for(const [sec,ext] of Object.entries(SECTIONS)){
    const dir=root+'/'+sec;
    if(!fs.existsSync(dir))continue;
    const files=walk(dir).map(f=>f.split(path.sep).join('/'))
      .filter(f=>f.endsWith(ext)&&!/\/(template|index)\.[a-z]+$/.test(f)).sort().reverse();
    fs.writeFileSync(dir+'/index.json',JSON.stringify(files,null,2)+'\n');
    console.log(dir,files.length);
  }
}
