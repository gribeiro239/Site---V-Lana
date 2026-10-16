import {DatabaseSync} from 'node:sqlite';
import fs from 'node:fs';
export function database(filename=':memory:'){
 const sql=new DatabaseSync(filename);sql.exec('PRAGMA foreign_keys=ON');
 for(const name of fs.readdirSync(new URL('../drizzle/',import.meta.url)).filter(n=>n.endsWith('.sql')).sort())sql.exec(fs.readFileSync(new URL('../drizzle/'+name,import.meta.url),'utf8'));
 const prepare=query=>({query,args:[],bind(...args){this.args=args;return this;},async first(){return sql.prepare(query).get(...this.args)||null;},async all(){return {results:sql.prepare(query).all(...this.args)};},async run(){const r=sql.prepare(query).run(...this.args);return {meta:{changes:Number(r.changes)}};}});
 return {sql,prepare,async batch(statements){sql.exec('BEGIN IMMEDIATE');try{const result=[];for(const s of statements)result.push(await s.run());sql.exec('COMMIT');return result;}catch(e){sql.exec('ROLLBACK');throw e;}},close(){sql.close();}};
}
