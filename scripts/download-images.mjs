// Downloads categorized, royalty-free property photography (Unsplash) into
// public/img/<category>/ for use as the sample-listing image pools.
// Run: node scripts/download-images.mjs
import { mkdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'public', 'img');

const CANDIDATES = {
  office: [
    'photo-1497366216548-37526070297c', 'photo-1497366811353-6870744d04b2',
    'photo-1497366754035-f200968a6e72', 'photo-1524758631624-e2822e304c36',
    'photo-1556761175-b413da4baf72', 'photo-1604328698692-f76ea9498e76',
    'photo-1497215728101-856f4ea42174', 'photo-1553877522-43269d4ea984',
    'photo-1517502884422-41eaead166d4', 'photo-1541746972996-4e0b0f43e02a',
    'photo-1504384308090-c894fdcc538d', 'photo-1519389950473-47ba0277781c',
    'photo-1556761175-4b46a572b786', 'photo-1571624436279-b272aff752b5',
  ],
  villa: [
    'photo-1512917774080-9991f1c4c750', 'photo-1613490493576-7fde63acd811',
    'photo-1600596542815-ffad4c1539a9', 'photo-1600585154340-be6161a56a0c',
    'photo-1600607687939-ce8a6c25118c', 'photo-1600585154526-990dced4db0d',
    'photo-1600566753086-00f18fb6b3ea', 'photo-1600047509807-ba8f99d2cdde',
    'photo-1580587771525-78b9dba3b914', 'photo-1613977257592-4871e5fcd7c4',
    'photo-1523217582562-09d0def993a6', 'photo-1564013799919-ab600027ffc6',
    'photo-1572120360610-d971b9d7767c', 'photo-1583608205776-bfd35f0d9f83',
    'photo-1416331108676-a22ccb276e35', 'photo-1605276374104-dee2a0ed3cd6',
  ],
  apartment: [
    'photo-1522708323590-d24dbb6b0267', 'photo-1502672260266-1c1ef2d93688',
    'photo-1560448204-e02f11c3d0e2', 'photo-1560185127-6ed189bf02f4',
    'photo-1560185009-5bf9f2849488', 'photo-1493809842364-78817add7ffb',
    'photo-1554995207-c18c203602cb', 'photo-1460317442991-0ec209397118',
    'photo-1449157291145-7efd050a4d0e', 'photo-1536376072261-38c75010e6c9',
    'photo-1598928506311-c55ded91a20c', 'photo-1616486338812-3dadae4b4ace',
    'photo-1616594039964-ae9021a400a0', 'photo-1615529182904-14819c35db37',
    'photo-1586023492125-27b2c045efd7', 'photo-1600210492486-724fe5c67fb0',
    'photo-1567016432779-094069958ea5', 'photo-1520250497591-112f2f40a3f4',
  ],
  warehouse: [
    'photo-1553413077-190dd305871c', 'photo-1568992687947-868a62a9f521',
    'photo-1586528116311-ad8dd3c8310d', 'photo-1578575437130-527eed3abbec',
    'photo-1554469384-e58fac16e23a', 'photo-1566576721346-d4a3b4eaeb55',
    'photo-1531834685032-c34bf0d84c77', 'photo-1565043666747-69f6646db940',
    'photo-1504328345606-18bbc8c9d7d1', 'photo-1605733513597-a8f8341084e6',
    'photo-1616432043562-3671ea2e5242', 'photo-1590247813693-5541d1c609fd',
    'photo-1601598851547-4302969d0614', 'photo-1571086291540-b137111fa1c7',
  ],
  shop: [
    'photo-1441986300917-64674bd600d8', 'photo-1472851294608-062f824d29cc',
    'photo-1567401893414-76b7b1e5a7a5', 'photo-1555529669-e69e7aa0ba9a',
    'photo-1521017432531-fbd92d768814', 'photo-1555396273-367ea4eb4db5',
    'photo-1601924994987-69e26d50dc26', 'photo-1556740738-b6a63e27c4df',
    'photo-1445205170230-053b83016050', 'photo-1560243563-062bfc001d68',
    'photo-1519567241046-7f570eee3ce6', 'photo-1481437156560-3205f6a55735',
    'photo-1580674285054-bed31e145f59', 'photo-1556742049-0cfed4f6a45d',
  ],
  'commercial-building': [
    'photo-1486406146926-c627a92ad1ab', 'photo-1487958449943-2429e8be8625',
    'photo-1554435493-93422e8220c8', 'photo-1467269204594-9661b134dd2b',
    'photo-1431576901776-e539bd916ba2', 'photo-1481253127861-534498909948',
    'photo-1448630360428-65456885c650', 'photo-1488972685280-c3fd157d7c59',
    'photo-1465447142348-e9952c393450', 'photo-1444723121867-7a241cacace9',
    'photo-1479839672679-a46483c0e7c8', 'photo-1518684079-3c830dcef090',
  ],
  'residential-building': [
    'photo-1545324418-cc1a3fa10c00', 'photo-1460317442991-0ec209397118',
    'photo-1515263487990-61b07816b324', 'photo-1449844908441-8829872d2607',
    'photo-1512918728675-ed5a9ecdebfd', 'photo-1574362848149-11496d93a7c7',
    'photo-1494522855154-9297ac14b55f', 'photo-1477587458883-47145ed94245',
    'photo-1567684014761-b65e2e59b9eb', 'photo-1518005020951-eccb494ad742',
    'photo-1522093007474-d86e9bf7ba6f', 'photo-1551361415-69c87624334f',
  ],
  dubai: [
    'photo-1512453979798-5ea266f8880c', 'photo-1518684079-3c830dcef090',
    'photo-1528702748617-c64d49f918af', 'photo-1546412414-e1885259563a',
  ],
};

const params = '?auto=format&fit=crop&w=1200&q=72';
let ok = 0, fail = 0;
for (const [cat, ids] of Object.entries(CANDIDATES)) {
  const dir = join(out, cat);
  await mkdir(dir, { recursive: true });
  let n = 0;
  for (const id of ids) {
    const url = `https://images.unsplash.com/${id}${params}`;
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
      const type = res.headers.get('content-type') || '';
      if (!res.ok || !type.startsWith('image')) { fail++; console.log(`  x ${cat}/${id} (${res.status})`); continue; }
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 15000) { fail++; console.log(`  x ${cat}/${id} too small`); continue; }
      n++;
      await writeFile(join(dir, `${String(n).padStart(2, '0')}.jpg`), buf);
      ok++;
    } catch (e) { fail++; console.log(`  x ${cat}/${id} ${e.message}`); }
  }
  console.log(`${cat}: ${n} images`);
}
console.log(`Done. ${ok} downloaded, ${fail} skipped.`);
