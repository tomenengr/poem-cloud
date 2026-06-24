import json

existing_poets = json.load(open('data/poets.json'))
existing_ids = {p['id'] for p in existing_poets}

new_poets = [
    {"id": "caocao", "name": "曹操", "dynasty": "其他", "bio": "东汉末年杰出的政治家、军事家、文学家。建安文学代表人物。", "worksCount": 20, "birthYear": 155, "deathYear": 220},
    {"id": "caozhi", "name": "曹植", "dynasty": "其他", "bio": "三国时期曹魏著名文学家，建安文学代表人物。才高八斗。", "worksCount": 35, "birthYear": 192, "deathYear": 232},
    {"id": "caopi", "name": "曹丕", "dynasty": "其他", "bio": "三国时期曹魏开国皇帝，文学家，著有《燕歌行》。建安文学代表。", "worksCount": 20, "birthYear": 187, "deathYear": 226},
    {"id": "wangbo", "name": "王勃", "dynasty": "唐", "bio": "唐初四杰之首。著名代表作《滕王阁序》。诗风清新自然。", "worksCount": 20, "birthYear": 650, "deathYear": 676},
    {"id": "luobinwang", "name": "骆宾王", "dynasty": "唐", "bio": "唐初四杰之一。七岁能咏鹅。诗风悲凉骨傲。", "worksCount": 15, "birthYear": 619, "deathYear": 684},
    {"id": "yangjiong", "name": "杨炯", "dynasty": "唐", "bio": "唐初四杰之一。善写边塞诗。", "worksCount": 10, "birthYear": 650, "deathYear": 692},
    {"id": "luzhaolin", "name": "卢照邻", "dynasty": "唐", "bio": "唐初四杰之一。诗风凄凉沉郁。", "worksCount": 10, "birthYear": 632, "deathYear": 695},
    {"id": "chenziang", "name": "陈子昂", "dynasty": "唐", "bio": "唐代文学家，诗文革新先驱。代表作《登幽州台歌》。风骨峥嵘。", "worksCount": 25, "birthYear": 661, "deathYear": 702},
    {"id": "wangchangling", "name": "王昌龄", "dynasty": "唐", "bio": "盛唐著名边塞诗人，被后人誉为“七绝圣手”。", "worksCount": 30, "birthYear": 698, "deathYear": 756},
    {"id": "wangzhihuan", "name": "王之涣", "dynasty": "唐", "bio": "盛唐著名边塞诗人。代表作《登鹳雀楼》《凉州词》。豪放不羁。", "worksCount": 6, "birthYear": 688, "deathYear": 742},
    {"id": "cen shen", "name": "岑参", "dynasty": "唐", "bio": "盛唐边塞诗人代表。诗风奇特瑰丽。", "worksCount": 40, "birthYear": 715, "deathYear": 770},
    {"id": "gaoshi", "name": "高适", "dynasty": "唐", "bio": "盛唐边塞诗人代表。与岑参并称“高岑”。", "worksCount": 35, "birthYear": 704, "deathYear": 765},
    {"id": "hezhizhang", "name": "贺知章", "dynasty": "唐", "bio": "盛唐前期著名诗人、书法家。生性旷达豪放。", "worksCount": 15, "birthYear": 659, "deathYear": 744},
    {"id": "zhangjiuling", "name": "张九龄", "dynasty": "唐", "bio": "唐代政治家、文学家。开元名相。诗风清淡自然。", "worksCount": 25, "birthYear": 678, "deathYear": 740},
    {"id": "weiluyin", "name": "韦应物", "dynasty": "唐", "bio": "中唐山水田园诗派代表。与王维、孟浩然、柳宗元并称“王孟韦柳”。", "worksCount": 45, "birthYear": 737, "deathYear": 792},
    {"id": "liuzongyuan", "name": "柳宗元", "dynasty": "唐", "bio": "中唐文学家、思想家。唐宋八大家之一。山水诗成就卓著。", "worksCount": 35, "birthYear": 773, "deathYear": 819},
    {"id": "jia dao", "name": "贾岛", "dynasty": "唐", "bio": "中唐著名苦吟诗人。与孟郊并称“郊寒岛瘦”。", "worksCount": 20, "birthYear": 779, "deathYear": 843},
    {"id": "meng jiao", "name": "孟郊", "dynasty": "唐", "bio": "中唐著名苦吟诗人。诗风峭硬。", "worksCount": 25, "birthYear": 751, "deathYear": 814},
    {"id": "lihe", "name": "李贺", "dynasty": "唐", "bio": "中唐浪漫主义诗人。有“诗鬼”之称。诗风诡谲奇特。", "worksCount": 30, "birthYear": 790, "deathYear": 816},
    {"id": "pi rixiu", "name": "皮日休", "dynasty": "唐", "bio": "晚唐诗人、文学家。与陆龟蒙并称“皮陆”。", "worksCount": 15, "birthYear": 834, "deathYear": 883},
    {"id": "luguimeng", "name": "陆龟蒙", "dynasty": "唐", "bio": "晚唐诗人。隐居太湖。与皮日休齐名。", "worksCount": 15, "birthYear": 0, "deathYear": 881},
    {"id": "suxun", "name": "苏洵", "dynasty": "宋", "bio": "北宋散文家。唐宋八大家之一。“三苏”之父。", "worksCount": 15, "birthYear": 1009, "deathYear": 1066},
    {"id": "zeng gong", "name": "曾巩", "dynasty": "宋", "bio": "北宋文学家。唐宋八大家之一。散文名家。", "worksCount": 15, "birthYear": 1019, "deathYear": 1083},
    {"id": "wen tianxiang", "name": "文天祥", "dynasty": "宋", "bio": "南宋末年政治家、文学家，民族英雄。代表作《正气歌》。气节高尚。", "worksCount": 25, "birthYear": 1236, "deathYear": 1283},
    {"id": "lu benzhong", "name": "吕本中", "dynasty": "宋", "bio": "南宋诗人、词人。江西诗派重要人物。", "worksCount": 10, "birthYear": 1084, "deathYear": 1145},
    {"id": "yang wanli", "name": "杨万里", "dynasty": "宋", "bio": "南宋著名诗人。创造了“诚斋体”。与陆游、尤袤、范成大并称“南宋四大家”。", "worksCount": 40, "birthYear": 1127, "deathYear": 1206},
    {"id": "fan chengda", "name": "范成大", "dynasty": "宋", "bio": "南宋著名诗人。南宋四大家之一。田园诗成就卓著。", "worksCount": 35, "birthYear": 1126, "deathYear": 1193},
    {"id": "you mao", "name": "尤袤", "dynasty": "宋", "bio": "南宋著名诗人。南宋四大家之一。", "worksCount": 10, "birthYear": 1127, "deathYear": 1194},
    {"id": "jiang kui", "name": "姜夔", "dynasty": "宋", "bio": "南宋著名词人、音乐家。号白石道人。词风清空高洁。", "worksCount": 20, "birthYear": 1155, "deathYear": 1209},
    {"id": "wu wenying", "name": "吴文英", "dynasty": "宋", "bio": "南宋著名词人。号梦窗。词风密丽晦涩。", "worksCount": 20, "birthYear": 1200, "deathYear": 1260},
    {"id": "yuanhaowen", "name": "元好问", "dynasty": "元", "bio": "金末元初著名文学家。被尊为“北方文雄”。代表作“问世间，情是何物”。", "worksCount": 30, "birthYear": 1190, "deathYear": 1257},
    {"id": "ma zhiyuan", "name": "马致远", "dynasty": "元", "bio": "元代著名戏曲家、散曲家。“元曲四大家”之一。代表作《天净沙·秋思》。", "worksCount": 20, "birthYear": 1250, "deathYear": 1321},
    {"id": "guan hanqing", "name": "关汉卿", "dynasty": "元", "bio": "元代杂剧奠基人。“元曲四大家”之首。", "worksCount": 15, "birthYear": 1220, "deathYear": 1300},
    {"id": "bai pu", "name": "白朴", "dynasty": "元", "bio": "元代著名戏曲家。“元曲四大家”之一。", "worksCount": 15, "birthYear": 1226, "deathYear": 1306},
    {"id": "zheng guangzu", "name": "郑光祖", "dynasty": "元", "bio": "元代著名戏曲家。“元曲四大家”之一。", "worksCount": 10, "birthYear": 1264, "deathYear": 1324},
    {"id": "gao qi", "name": "高启", "dynasty": "明", "bio": "元末明初著名诗人。“吴中四杰”之一。被誉为明初诗坛领袖。", "worksCount": 25, "birthYear": 1336, "deathYear": 1374},
    {"id": "tang yin", "name": "唐寅", "dynasty": "明", "bio": "明代著名画家、文学家。字伯虎。江南四大才子之一。", "worksCount": 30, "birthYear": 1470, "deathYear": 1524},
    {"id": "zhu zhishan", "name": "祝允明", "dynasty": "明", "bio": "明代著名书法家、文学家。江南四大才子之一。", "worksCount": 15, "birthYear": 1461, "deathYear": 1527},
    {"id": "wen zhengming", "name": "文徵明", "dynasty": "明", "bio": "明代著名画家、书法家。江南四大才子之一。", "worksCount": 20, "birthYear": 1470, "deathYear": 1559},
    {"id": "xu zhenqing", "name": "徐祯卿", "dynasty": "明", "bio": "明代著名文学家。江南四大才子之一。以前七子身份闻名。", "worksCount": 15, "birthYear": 1479, "deathYear": 1511},
    {"id": "wang shizhen", "name": "王世贞", "dynasty": "明", "bio": "明代中期文坛领袖。后七子之一。", "worksCount": 25, "birthYear": 1526, "deathYear": 1590},
    {"id": "yuan hongdao", "name": "袁宏道", "dynasty": "明", "bio": "明代晚期文学家。公安派代表人物。提倡“性灵说”。", "worksCount": 20, "birthYear": 1568, "deathYear": 1610},
    {"id": "zhang dai", "name": "张岱", "dynasty": "明", "bio": "明末清初文学家、史学家。绝代散文家。", "worksCount": 20, "birthYear": 1597, "deathYear": 1689},
    {"id": "guyanwu", "name": "顾炎武", "dynasty": "清", "bio": "明末清初杰出的思想家、史学家、语言学家。“天下兴亡，匹夫有责”。", "worksCount": 15, "birthYear": 1613, "deathYear": 1682},
    {"id": "huangzongxi", "name": "黄宗羲", "dynasty": "清", "bio": "明末清初杰出的思想家、史学家。“中国思想启蒙之父”。", "worksCount": 10, "birthYear": 1610, "deathYear": 1695},
    {"id": "wangfuzhi", "name": "王夫之", "dynasty": "清", "bio": "明末清初杰出的思想家、哲学家。与顾炎武、黄宗羲并称“明末清初三大思想家”。", "worksCount": 10, "birthYear": 1619, "deathYear": 1692},
    {"id": "yuan mei", "name": "袁枚", "dynasty": "清", "bio": "清代中期著名诗人、散文家。倡导“性灵说”。", "worksCount": 35, "birthYear": 1716, "deathYear": 1797},
    {"id": "zheng banqiao", "name": "郑燮", "dynasty": "清", "bio": "清代书画家、文学家。号板桥。扬州八怪之一。", "worksCount": 25, "birthYear": 1693, "deathYear": 1766},
    {"id": "gong zizhen", "name": "龚自珍", "dynasty": "清", "bio": "清代思想家、诗词家。近代启蒙先驱。代表作《己亥杂诗》。", "worksCount": 30, "birthYear": 1792, "deathYear": 1841},
    {"id": "qiu jin", "name": "秋瑾", "dynasty": "清", "bio": "清末女民主革命家、诗人。号鉴湖女侠。诗词雄健豪放。", "worksCount": 20, "birthYear": 1875, "deathYear": 1907}
]

for p in new_poets:
    if p['id'] not in existing_ids:
        existing_poets.append(p)
        existing_ids.add(p['id'])

with open('data/poets.json', 'w', encoding='utf-8') as f:
    json.dump(existing_poets, f, ensure_ascii=False, indent=2)

print(f"Total poets now: {len(existing_poets)}")
