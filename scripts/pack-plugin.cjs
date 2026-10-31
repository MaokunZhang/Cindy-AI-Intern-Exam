// 使用指定 Cindy checkout 的生产 Forge 打包器；不触碰安装目录、授权状态或用户凭证。
const fs=require('node:fs/promises');
const path=require('node:path');
const {createRequire}=require('node:module');
const crypto=require('node:crypto');
(async()=>{
  const [repoArg,pluginArg,scratchArg]=process.argv.slice(2);
  if(!repoArg||!pluginArg||!scratchArg)throw new Error('用法: node pack-plugin.cjs <Cindy源码目录> <插件源码目录> <构建临时目录>');
  const repo=path.resolve(repoArg),plugin=path.resolve(pluginArg),scratch=path.resolve(scratchArg);
  await fs.mkdir(scratch,{recursive:true});
  const requireCindy=createRequire(path.join(repo,'package.json'));
  const {build}=requireCindy('esbuild');
  const bundle=path.join(scratch,'forge-pack.cjs');
  await build({
    stdin:{contents:`export {packGhostDir} from ${JSON.stringify(path.join(repo,'apps/desktop/src/main/cindy-brain/forge.ts'))};`,resolveDir:repo,loader:'ts'},
    outfile:bundle,bundle:true,platform:'node',format:'cjs',logLevel:'warning',
    plugins:[{name:'cindy-raw-imports',setup(b){
      b.onResolve({filter:/\?raw$/},args=>({path:path.resolve(args.resolveDir,args.path.slice(0,-4)),namespace:'raw'}));
      b.onLoad({filter:/.*/,namespace:'raw'},async args=>({contents:await fs.readFile(args.path,'utf8'),loader:'text'}));
    }}]
  });
  const {packGhostDir}=require(bundle);
  const result=await packGhostDir(plugin,{sessionWorkdir:path.dirname(plugin)});
  if(!result.ok)throw new Error(JSON.stringify(result));
  console.log(JSON.stringify({ok:result.ok,path:result.cindyPath,bytes:result.buf.length,sha256:crypto.createHash('sha256').update(result.buf).digest('hex')},null,2));
})().catch(error=>{console.error(error);process.exitCode=1;});
