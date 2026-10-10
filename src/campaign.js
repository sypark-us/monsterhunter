/* Authored campaign content. Public character presentation carries no demon identity. */
(function(root,factory){
 const base=typeof module==='object'&&module.exports?require('./story.js'):root.HundredStory;
 const api=factory(base);if(typeof module==='object'&&module.exports)module.exports=api;root.HundredCampaign=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(Base){
 'use strict';
 const cast={...Base.cast,
  mei:{name:'Mei Wong',role:'Community nurse'},celia:{name:'Celia Tang',role:'Relief fund administrator'},
  owen:{name:'Owen Chan',role:'Freelance photographer'},jun:{name:'Jun Mak',role:'Ferry dispatcher'},
  sora:{name:'Sora Lam',role:'Archivist'}
 };
 const places={...Base.places,
  clinic:{name:'Night Clinic',people:['mei','ada'],description:'The clinic keeps one light on after closing. Mei works through a stack of forms while the last patients wait beneath a slow ceiling fan.'},
  market:{name:'Temple Street Market',people:['owen','marcus'],description:'Tarpaulins collect the rain above the last open stalls. Owen dries a camera strap with his sleeve. A delivery bike leans against a shutter.'},
  pier:{name:'Ferry Pier',people:['jun','iris'],description:'The harbour is almost black. A ferry announcement echoes through the empty concourse, followed by a name nobody seems to recognise.'},
  rooftop:{name:'Kowloon Rooftop',people:['sora','iris'],description:'Above the traffic, the city sounds like the sea. Two folding chairs stand near a water tank. Someone has brought tea, but only one cup.'}
 };
 const supportingCast=[
  ['Eunice Ho','Keira’s father’s home-care aide'],['Dr. Leung','The night clinic’s exhausted doctor'],['Mrs. Cheng','Iris’s grandmother'],
  ['Wai Cheung','A missing hotel porter'],['Anita So','A relief-fund applicant'],['Sam Wu','A ferry maintenance worker'],
  ['Grace Poon','A passenger looking for her brother'],['Henry Poon','Grace’s missing brother'],['Bo Lee','Marcus’s dispatch supervisor'],
  ['Tessa Lau','A hotel housekeeper'],['Patrick Ng','A relief-fund auditor'],['Lily Lam','Sora’s estranged daughter'],
  ['Ming Tse','A market stallholder'],['Aaron Yip','Marcus’s younger brother'],['Nora Wong','Mei’s mentor'],
  ['Kit Cheung','Wai’s sister'],['Ruth Chan','Owen’s mother'],['Mr. Fong','Your landlord']
 ].map(([name,role])=>({name,role}));
 const topic=(id,ask,answer,extra={})=>({id,ask,answer,...extra});
 const talk=(greeting,topics)=>({greeting,topics});
 const chapters=[
 {id:1,title:'The First Vow',objective:'Listen to the city. Learn what your voice can do before dawn.',opening:Base.places.apartment.description,conversations:Base.conversations,people:Object.fromEntries(Object.entries(Base.places).map(([k,p])=>[k,p.people])),reward:'The oath is yours to wield. Someone else has noticed.'},
 {id:2,title:'Borrowed Breath',objective:'Find out why the relief fund’s clients are disappearing. Learn the price of accepting help.',opening:'Morning brings a receipt slipped under your door. It lists your name, a debt you never incurred, and the words PAID IN FULL. Ada says Mr. Fong wants his rent. The voice inside you wants to know who sent the receipt.',people:{apartment:['ada'],street:['marcus','iris'],diner:['keira','mei'],hotel:['celia','daniel'],shrine:['yuen'],clinic:['mei','ada'],market:['owen','marcus']},reward:'The fund closes. Its accounts do not balance, but its clients can breathe again.',conversations:{
  ada:talk('You came home after sunrise. I was going to call someone. Then I realised I didn’t know who you would want me to call.',[
   topic('ada_truth','Tell Ada you are in danger.','She folds the receipt instead of reading it again. “Then don’t disappear without telling me. You don’t have to explain everything to let someone help.”',{trust:1,set:['c2_confided']}),
   topic('ada_receipt','Ask about the receipt.','“Anita So got one of these. She said the fund had cleared her father’s hospital bill. Last week she stopped answering her phone.”',{set:['c2_anita']}),
   topic('ada_rest','Ask for somewhere quiet to rest.','“Take the sofa. I’ll wake you before I leave for the clinic.”',{effect:'rest',repeatable:true})]),
  mei:talk('If you’re here about the fund, take a number. If you’re here because you can’t breathe, sit down now.',[
   topic('mei_missing','Who has stopped coming to the clinic?','“Anita. Wai Cheung, the hotel porter. Three more this week. Dr. Leung thinks they’re avoiding bills. But the bills were already paid.”',{set:['c2_missing']}),
   topic('mei_help','Offer to carry supplies to the waiting room.','Mei puts a box in your hands. “Thank you. Nora Wong used to say the difference between helping and owning someone is whether you let them leave.”',{requires:['c2_missing'],trust:1,set:['c2_help']}),
   topic('mei_debt','What did the fund ask in return?','“A signature acknowledging a debt. Not money. Celia says the amount is symbolic. No one reads past the word approved.”',{requires:['c2_help'],set:['c2_debt']}),
   topic('mei_courage','Tell her you will keep the patients out of this.','“Don’t make a promise you can’t keep. Come back when you know what you’re asking of us.”',{requires:['c2_missing'],check:{stat:'charisma',min:2},trust:1,set:['c2_help']})]),
  owen:talk('No flash. People are nervous enough without someone pointing a bright light in their faces.',[
   topic('owen_photo','Ask about the relief fund.','“Patrick Ng hired me to photograph their opening. Celia kept moving the applicants in front of a mirror. I thought she wanted better light.”',{set:['c2_photo']}),
   topic('owen_negative','Ask whether he kept the photographs.','“Of course. Ming Tse lent me a dry corner of his stall. One shot has Wai holding a receipt after he signed. The receipt is blank.”',{requiresTopics:['owen_photo'],set:['c2_blank']}),
   topic('owen_help','Ask him to bring the photographs to the clinic.','“I’ll make copies. Ruth, my mother, would tell me not to get involved. Then she’d ask who else was going to.”',{requiresTopics:['owen_photo'],trust:1,set:['c2_photo']})]),
  keira:talk('Mei has been staying late at the clinic. She carries the heaviest boxes herself, even when someone offers to help.',[
   topic('keira_support','Ask whether help creates a debt.','“Eunice looks after my father when I’m here. I pay her, but she doesn’t call that a debt. If I needed to stop tomorrow, she’d still bring him soup. Help ends when the need ends.”',{requires:['c2_help'],trust:1,set:['c2_paid']}),
   topic('keira_meal','Order a hot meal. (HK$20)','“You look like you need it. Eat first. Questions after.”',{effect:'meal',repeatable:true}),
   topic('keira_work','Help close the stall. (+HK$120)','“There’s a delivery to put away. I’ll pay you before you go.”',{effect:'work'})]),
  celia:talk('You must be the person from the hotel. Discretion is difficult in this city. Fortunately, we can offer practical help.',[
   topic('celia_work','Ask what the relief fund is meant to do.','“People fall through gaps. A little structure catches them. You would be surprised how much someone will surrender to be caught.”'),
   topic('celia_offer','Offer to help finish her accounts.','“You would do that without payment? Very well. I accept your help.” She slides the ledger toward you, leaving her own hand on its cover. Beside it, she places a blank acknowledgement and a pen. “You can sign here.”',{requires:['c2_missing'],set:['c2_accepted']}),
   topic('celia_blank','Sign the blank acknowledgement she offers.','The pen moves before you decide what to write. Your breath catches. Celia writes the amount herself. The page has room for every breath you will ever take.',{requires:['c2_accepted'],effect:'falseName'}),
   topic('celia_receipt','The clinic’s bills are paid. Your debt is finished.','“The bills are paid,” she says. “Yes.” You leave your hand on the ledger. “Then the help I offered is complete.” Her grip loosens. “Fine. I have no further claim on it.”',{requires:['c2_accepted','c2_paid','c2_photo'],set:['c2_released']}),
   topic('celia_read','Read the ledger’s missing clause aloud.','“Acknowledgement ends when the service is fulfilled.” Celia watches you finish the sentence. “You should have gone into law.”',{requires:['c2_accepted'],check:{stat:'intelligence',min:2},set:['c2_released']}),
   topic('celia_release','Say: “What was given is returned.”','The ledger’s pages turn without wind. Somewhere downstairs, a woman draws a long, unbroken breath.',{requires:['c2_accepted','c2_released'],effect:'campaignCast',target:'celia'})]),
  daniel:talk('They changed the name on the office. The lock is the same.',[
   topic('daniel_porter','Ask about Wai Cheung.','“Tessa Lau saw him leave with a blue envelope. Kit, his sister, came looking for him yesterday. I told her I’d call if he returned.”',{set:['c2_missing']}),
   topic('daniel_support','Tell him he did the right thing by speaking.','He looks at the reception desk instead of you. “I’m trying to do it sooner this time.”',{trust:1})])
 }},
 {id:3,title:'The Last Crossing',objective:'Learn what the last ferry is carrying, and find a way to bring its passengers home.',opening:'A message arrives from Iris: GRACE IS STILL AT THE PIER. SHE THINKS HENRY IS ON THE NEXT BOAT. The last ferry left an hour ago. In the distance, its horn sounds again.',people:{apartment:['ada'],street:['marcus'],diner:['keira'],shrine:['yuen','iris'],market:['owen'],pier:['jun','iris'],clinic:['mei']},reward:'The ferry returns with every light on. Nobody remembers the crossing the same way.',conversations:{
  jun:talk('The next boat is delayed. It will arrive when everyone has decided where they’re going.',[
   topic('jun_job','Why are you still working?','“Sam Wu stayed to fix the ramp. Someone has to dispatch the boat when he finishes. He told me to go home. That would leave people waiting.”'),
   topic('jun_passage','Ask whether she could accompany you on the last crossing to look for Henry.','“You’re looking for him?” She checks the dark water. “All right. I promise we’ll cross together. Wait here until I call.”',{set:['c3_passage']}),
   topic('jun_manifest','Ask her to check Henry’s name on the passenger list.','“He’s on tomorrow’s manifest. He hasn’t arrived yet.” You tell her Grace is still waiting. Jun closes the book. “Then she should stop waiting.”',{requires:['c3_passage'],set:['c3_manifest']}),
   topic('jun_aboard','Board without asking where the boat is going.','The gangway stays beneath your feet as the pier disappears. Jun turns the destination board around. It bears your name.',{requires:['c3_passage'],effect:'falseName'}),
   topic('jun_return','Ask her to promise the boat will come back.','“I said we would cross together. I never said we would return.” You repeat what you learned about crossings. She looks toward the ramp, where Sam is waving her home.',{requires:['c3_manifest','c3_route','c3_rule'],set:['c3_return']}),
   topic('jun_listen','Hear the second announcement behind the first.','The voice beneath the announcement says departure, departure, departure. There is no word for arrival. You ask Jun who erased it.',{requires:['c3_manifest'],check:{stat:'sense',min:2},set:['c3_return']}),
   topic('jun_refuse','Stay on the pier. Ask her to cross alone.','“Then I withdraw my promise,” she says. “We won’t cross together.” Sam calls her name again. This time, she hears him.',{requires:['c3_return'],set:['c3_refused']}),
   topic('jun_release','Say: “No passage without return.”','The harbour gives back the lights it borrowed. Jun falls to her knees as the boat touches the pier. Grace runs down the ramp before anyone can stop her.',{requires:['c3_passage','c3_refused'],effect:'campaignCast',target:'jun'})]),
  iris:talk('Grace said she didn’t want to wait alone. I said I’d stay. I didn’t think she meant all night.',[
   topic('iris_grace','What happened to Henry?','“He took an extra shift on the ferry. Grace got a message from him after the last boat left. It only said don’t come looking.”',{set:['c3_manifest']}),
   topic('iris_stay','Tell Iris to take Grace somewhere warm.','“Keira’s still open?” She checks your face. “You aren’t asking me to abandon her. You’re asking me to get her home.”',{trust:1,set:['c3_shelter']})]),
  marcus:talk('Bo told me not to deliver to the pier tonight. Bo never turns down a paid delivery.',[
   topic('marcus_route','Ask why dispatch changed the route.','“Aaron did that run yesterday. He says the ferry boarded six people and came back with five. The driver called it a counting error. Aaron counted twice.”',{set:['c3_route']}),
   topic('marcus_brother','Promise to warn Aaron before the next shift.','“Don’t promise me. Send him the message now.” You do. Marcus waits until the reply arrives before thanking you.',{requiresTopics:['marcus_route'],trust:1,set:['c3_warned']})]),
  yuen:talk('People leave offerings here before a journey. They rarely come back to say whether they arrived.',[
   topic('yuen_crossing','What binds a spirit to a crossing?','“A passage is a promise in two directions. If it carries you away but cannot bring you back, refuse it while your feet still touch the shore.”',{requires:['c3_manifest'],set:['c3_rule']}),
   topic('yuen_human','Can someone caught in a spirit’s crossing be brought home?','“A host can be lost before their body dies. Speak to what remains of the person. A rule alone is a poor rescue.”',{trust:1})]),
  keira:talk('I keep a pot warm for people coming off the late ferry. If anyone’s stuck waiting at the pier, there’s food here.',[
   topic('keira_meal','Eat before going to the pier. (HK$20)','“No heroics on an empty stomach.”',{effect:'meal',repeatable:true}),
   topic('keira_work','Help prepare food for the passengers. (+HK$120)','You stack bowls while Keira boils another kettle. She presses the money into your hand. “I still pay my staff.”',{effect:'work',trust:1})])
 }},
 {id:4,title:'What the City Keeps',objective:'Discover what the archivist has taken. Decide which memories are worth protecting.',opening:'Ada has forgotten your first meeting. Owen’s mother no longer recognises him in photographs. On the roof, an archivist is buying the memories nobody thinks they can afford to keep.',people:{apartment:['ada'],street:['marcus','iris'],diner:['keira'],clinic:['mei'],market:['owen'],rooftop:['sora'],shrine:['yuen'],pier:['daniel']},reward:'The archive opens. The city does not get every memory back, but it gets the right to remember.',conversations:{
  sora:talk('Everyone brings something up here. Most people call it baggage. I prefer a more respectful word.',[
   topic('sora_price','Ask what she buys.','“A memory. One that hurts. In return, I take its weight off your life.” She pours tea into the only cup. “Lily freely entrusted her grief to me. I promised to keep what she gave. I will keep anything you freely entrust to me.”',{set:['c4_offer']}),
   topic('sora_trade','Give her the memory of your first friend.','You remember the shape of a door, then nothing beyond it. The voice inside you knows someone lived there. It refuses to tell you who.',{requires:['c4_offer'],humanity:-2,set:['c4_surrendered']}),
   topic('sora_daughter','Ask who Lily is to her.','The kettle stops rattling. “My daughter has a life of her own. She should not spend it caring for someone who already chose what to keep.”',{requires:['c4_offer'],set:['c4_lily']}),
   topic('sora_challenge','Show her what survived outside her archive.','“A photograph isn’t a memory,” she says. You describe the accounts you heard and the memories people still share. “And neither is a voice recording,” Sora adds, although you have not mentioned a recording. Her hand closes around the cup.',{requires:['c4_offer','c4_memory','c4_witness','c4_negative'],set:['c4_challenged']}),
   topic('sora_command','Hold the archive open with your voice.','For a moment, your voice and the thing in your chest speak together. Sora sets the cup down. “You could have asked,” she says. “I might even have answered.”',{requires:['c4_offer','c4_witness'],check:{stat:'dominion',min:2},humanity:-1,set:['c4_challenged']}),
   topic('sora_renounce','Ask her to give Lily back her own memories.','“I kept them so she wouldn’t suffer.” You wait. At last Sora says, “Then I reject the trust I accepted. Let her remember what I did.”',{requires:['c4_challenged'],set:['c4_renounced']}),
   topic('sora_release','Say: “What is remembered belongs to the living.”','Above the water tank, voices rise like birds. Sora reaches for a voice that calls her Mother. For once, she lets it pass.',{requires:['c4_offer','c4_renounced'],effect:'campaignCast',target:'sora'})]),
  ada:talk('I know you live next door. I know we used to talk. I don’t know why I trusted you.',[
   topic('ada_memory','Tell her how you first met.','You tell her about the broken lift, the shopping bags, and Mr. Fong pretending not to hear the bell. Ada laughs before the story ends. “I know that laugh,” she says. “Even if I don’t know the story.”',{set:['c4_memory'],trust:1}),
   topic('ada_keep','Tell her she owes you nothing.','“Good,” she says. “Then I’ll decide whether to help you again.” She takes her coat from the back of the chair.',{requires:['c4_memory'],trust:1}),
   topic('ada_rest','Rest while she puts the kettle on.','“Sleep. I’ll still be here when you wake.”',{effect:'rest',repeatable:true})]),
  mei:talk('Memory tests don’t tell you what someone misses. They tell you what the test expects them to remember.',[
   topic('mei_witness','Ask about the missing memories.','“Nora kept recordings for patients who couldn’t tell their families what happened. Lily Lam made one last year. She says her mother offered to remove the grief. The recording survived.”',{set:['c4_witness']}),
   topic('mei_consent','Ask whether forgetting can be a kindness.','“Sometimes. But consent isn’t a signature you keep forever. People can change their minds. Especially when you hid the cost.”',{trust:1})]),
  owen:talk('My mother remembers the camera. She gave it to me. She doesn’t remember the person she gave it to.',[
   topic('owen_negative','Ask whether the old negatives changed too.','“No. Ruth wrote my name on the envelopes. Ming kept a box safe during the flood. Sora can remove a picture from someone’s head. She can’t erase every copy outside it.”',{set:['c4_negative']}),
   topic('owen_mother','Offer to go through the photographs with Ruth.','“She doesn’t need a stranger to explain her son.” He stops, then adds, “Maybe she does need someone who isn’t trying so hard to be remembered.”',{trust:1})]),
  keira:talk('My father forgot my birthday. He remembered the recipe for this soup. I’m trying not to decide which one matters more.',[
   topic('keira_memory','Ask what she would choose to forget.','“The hospital corridor. But then I might forget why Eunice stayed with him. I don’t think the good parts come apart from the bad ones cleanly.”',{trust:1}),
   topic('keira_meal','Order soup. (HK$20)','“Something warm. Something you know.”',{effect:'meal',repeatable:true}),
   topic('keira_work','Help prepare tomorrow’s stock. (+HK$120)','You wash rice while she labels the containers. She pays you before you can offer to do it for free.',{effect:'work'})])
 }},
 {id:5,title:'The Hundredth Name',objective:'Find who wrote the tournament’s rules. Choose what survival will mean.',opening:'The voice inside you remembers its name. It will not say it aloud. Iris sends one final message: COME TO THE ROOF. THIS TIME, BRING YOUR OWN NAME.',people:{apartment:['ada'],street:['marcus','daniel'],diner:['keira','mei'],clinic:['mei'],market:['owen'],pier:['jun'],shrine:['yuen'],rooftop:['iris']},reward:'The city waits below you. For the first time, the voice has nothing to say.',conversations:{
  ada:talk('Whatever happens tonight, there will still be bins to take out tomorrow. I’m holding you to your share.',[
   topic('ada_future','Ask whether you can come home afterward.','“That depends. Are you asking because you want a home, or because you want someone to wait in it?” You tell her the truth. She gives you a spare key.',{trust:1,requiresTrust:{ada:1},set:['c5_home']}),
   topic('ada_apology','Apologise for leaving her outside your decisions.','“Then let me make one myself. I want you to have somewhere to come back to.”',{trust:1}),
   topic('ada_rest','Rest before going to the roof.','She leaves the light on in the hall. You sleep without a borrowed memory for the first time in days.',{effect:'rest',repeatable:true})]),
  keira:talk('I closed early. Eunice is with my father, and Mei took the food to the clinic. The city can manage without me for one evening.',[
   topic('keira_future','Tell her you might not come back.','“People say that when they want you to stop asking them to.” She takes off her apron. “I want you to come back. Let that make your decision harder.”',{trust:1,requiresTrust:{keira:1},set:['c5_anchor']}),
   topic('keira_reconnect','Ask how her father is doing.','“Better. Eunice got him out for a walk.” Keira smiles. “Thank you for remembering to ask.”',{trust:1}),
   topic('keira_meal','Share one last meal. (HK$20)','You eat slowly. Neither of you calls it the last one.',{effect:'meal',repeatable:true}),
   topic('keira_work','Help put the stall away. (+HK$120)','There is ordinary work left to do. You do it. She pays you, and the familiarity steadies your hands.',{effect:'work'})]),
  yuen:talk('The first story I told you was true. It was not the whole truth. That is a distinction people use to forgive themselves.',[
   topic('yuen_origin','Who wrote the rules?','“The hundred did. They bound themselves freely to one contest and gave its keeper the right to enforce it. The keeper must reject the contest before anyone can release the vow.”',{set:['c5_origin']}),
   topic('yuen_voice','Why did my demon forget?','“Because a creature that remembers every life it took cannot call itself innocent. Forgetting was the first bargain. Your host was the second.”',{requires:['c5_origin'],set:['c5_truth']}),
   topic('yuen_host','Can I save the person carrying it?','“You are that person. Do not let it make you speak of yourself as a room it happens to occupy.”',{trust:1})]),
  iris:talk('My grandmother used to tell me stories about a hundred hungry guests. Mrs. Cheng left out the part where one of them had to keep count.',[
   topic('iris_names','Ask why she invited you to the roof.','“I wanted to hear your answer in person. To see whether you would speak for yourself, or let the voice in you speak.” She watches you recognise the voice behind her own.',{requires:['c5_origin'],set:['c5_names']}),
   topic('iris_host','Tell her the hosts never agreed to the tournament.','“No,” she says. “They agreed to nothing.” You speak of Ada’s key, Keira’s stall, and people waiting for a boat. Iris looks down at the city.',{requires:['c5_names','c5_home','c5_anchor'],set:['c5_hosts']}),
   topic('iris_reason','Show that the tournament contradicts its own vow.','“A willing promise cannot bind an unwilling host,” you say. “Your own rule invalidates the contest.” Iris closes her eyes. “You learned to listen.”',{requires:['c5_names'],check:{stat:'intelligence',min:3},set:['c5_hosts']}),
   topic('iris_refuse','Ask her to withdraw the promise that keeps the contest alive.','“I reject the contest,” she says, slowly. “I withdraw the promise I freely gave. No host owes us their life.” The voice inside you cries out. You let her finish.',{requires:['c5_hosts'],set:['c5_refused']}),
   topic('iris_throne','Choose to take the keeper’s place.','The city becomes a board of lights. You understand how easy it would be to call them pieces. Iris whispers, “Then remember that you chose this.”',{requires:['c5_names'],effect:'campaignCast',target:'iris',humanity:-2,set:['c5_throne']}),
   topic('iris_release','Say: “I release you from your promise.”','One hundred names pass through the night air. The voice in your chest becomes small enough to hear as a voice, rather than a command. Iris sits down. She asks whether there is any tea left.',{requires:['c5_refused'],effect:'campaignCast',target:'iris'})]),
  mei:talk('The clinic opens tomorrow. We could use another pair of hands. There’s a place on the volunteer rota if you want it.',[
   topic('mei_future','Offer to come back and volunteer.','“All right. Don’t be late.” The simplicity of the request is almost unbearable.',{trust:1})]),
  owen:talk('I took a photograph of the roof before the rain started. For once, it isn’t proof of anything.',[
   topic('owen_future','Ask him to keep it anyway.','“I will. Not everything we keep needs to win an argument.”',{trust:1})])
 }}
 ];
 // Supporting people have their own scenes and accounts, not just names in a list.
 const supporting=[
  ['eunice','Eunice Ho','Home-care aide',2,'diner','Keira’s father is asleep, and I finally have time for tea.','Ask about her work looking after Keira’s father.','His bills are paid, but he still needs someone. The fund said its clients owed them attendance. Care isn’t an appointment you can repossess.',{set:['c2_paid'],trust:1}],
  ['leung','Dr. Leung','Night-clinic doctor',2,'clinic','If this is about a missing patient, talk to me before you talk to the newspapers.','Ask whether the disappearances followed treatment.','No. Every account was settled. Anita stopped coming after the fund asked her to sign a second form. Mei brought me three more cases with the same dates.',{set:['c2_missing'],trust:1}],
  ['cheng','Mrs. Cheng','Iris’s grandmother',3,'shrine','I used to tell my granddaughter stories here. She preferred the frightening ones.','Ask what stories she knows about the ferry.','A journey offered freely can still be refused before departure. Once you cross, the ferryman decides which shore has your name.',{set:['c3_rule'],trust:1}],
  ['wai','Wai Cheung','Hotel porter',2,'market','Kit told me to stay somewhere crowded. I don’t think the market is crowded enough.','Ask what made Kit worry about him.','The fund offered to clear my bills. The receipt was blank when I signed. Owen photographed it. That’s the only reason I know I didn’t imagine the words arriving later.',{set:['c2_photo'],trust:1}],
  ['anita','Anita So','Relief-fund applicant',2,'street','I’m not missing. I just stopped going places where people might ask me to repay them.','Ask what the fund demanded.','Celia said the money was a gift. Then she said every gift creates a debt. I paid the hospital myself. She still called.',{set:['c2_missing','c2_paid'],trust:1}],
  ['sam','Sam Wu','Ferry mechanic',3,'market','Ramp’s fixed. Radio’s working. None of that explains why the boat keeps coming back empty.','Ask whether the passengers disembarked.','Not here. I counted them from the engine room. The announcement says departure twice, but never arrival. Marcus’s brother noticed too.',{set:['c3_route'],trust:1}],
  ['grace','Grace Poon','Henry’s sister',3,'pier','If you tell me to go home, tell me where my brother is first.','Offer to wait with her.','Henry’s name is on tomorrow’s manifest. It was on yesterday’s too. Jun says that means he hasn’t arrived. I think it means she won’t let him.',{set:['c3_manifest'],trust:1}],
  ['henry','Henry Poon','Ferry crew member',4,'clinic','Grace brought me here after the crossing. Mei says sleep will help.','Ask what he remembers of returning.','My sister remembers bringing me home. I remember the boat, but the shore keeps disappearing when I close my eyes. Please write down what happened before someone offers to take those memories away.',{set:['c4_witness'],trust:1}],
  ['bo','Bo Lee','Dispatch supervisor',3,'street','I stopped sending riders to the pier because I was scared. I won’t send another just to prove I was wrong.','Ask why he turned down the pier deliveries.','Aaron counted six passengers going out and five returning. Sam counted the same. I wasn’t going to send another rider to prove them right.',{set:['c3_route'],trust:1}],
  ['tessa','Tessa Lau','Housekeeper',2,'hotel','You’d be surprised what people leave in a room they think nobody will enter.','Ask whether she noticed anything unusual in the fund’s office.','A stack of returned receipts. Patrick marked every account paid. Celia crossed out the dates. Not the amounts, only the dates.',{set:['c2_paid'],trust:1}],
  ['patrick','Patrick Ng','Fund auditor',2,'rooftop','The view makes the numbers look less serious. It doesn’t change them.','Ask what he found in the fund’s accounts.','Acknowledgement ends when the service is fulfilled. Celia put that in the original agreement herself. Make her admit the service is over.',{set:['c2_photo'],trust:1}],
  ['lily','Lily Lam','Sora’s daughter',4,'street','My mother took the grief because I asked. She took the rest because she decided I couldn’t bear it.','Ask what her mother promised.','To keep what I entrusted to her. I changed my mind, but she called that ingratitude. Nora recorded me asking for my memories back.',{set:['c4_witness'],trust:1}],
  ['ming','Ming Tse','Market stallholder',4,'market','Owen left a box with me before the flood. I kept it dry. Nobody thanked me for the floor I lost.','Ask what was in the box.','Negatives, labelled in Ruth’s handwriting. Sora can take a memory from a person, but these never belonged to her archive.',{set:['c4_negative'],trust:1}],
  ['aaron','Aaron Yip','Student delivery rider',3,'apartment','Marcus keeps telling me to stay in. I still have a shift to pay for.','Ask why Marcus is worried about his deliveries.','I made a delivery to the pier. Six people boarded. Five came back. Jun told me I’d counted a shadow. I know what a shadow looks like on wet pavement.',{set:['c3_route'],trust:1}],
  ['nora','Nora Wong','Retired community nurse',4,'clinic','Mei thinks she has to solve every case herself. I remember being that tired.','Ask about her work with people who lost memories.','Lily Lam asked for her memories back, and I recorded her saying it. Consent can be withdrawn. Keeping a recording made that withdrawal survive.',{set:['c4_witness'],trust:1}],
  ['kit','Kit Cheung','Wai’s sister',2,'apartment','I’m looking for my brother, Wai. Ada let me wait here while I ask around.','Ask what happened to Wai.','The fund paid his account, but then they told him to sign again. I asked him to stay somewhere busy, like the market. If someone helps you and won’t let you go, what do you call that?',{set:['c2_missing'],trust:1}],
  ['ruth','Ruth Chan','Owen’s mother',4,'apartment','I recognise the handwriting on the envelopes. I don’t recognise why I wrote the name.','Ask to look through the photographs with her.','This is Owen. I know because I wrote it before I forgot. The picture isn’t a memory yet. Perhaps we can start with a picture.',{set:['c4_memory','c4_negative'],trust:1}],
  ['fong','Mr. Fong','Landlord',2,'apartment','Rent isn’t a curse. It just feels like one when it’s late.','Ask whether he can give you more time.','Ada already asked. I gave her until tomorrow. Don’t make her spend her goodwill on you if you aren’t planning to come back.',{trust:1,humanity:1}]
 ];
 const care={
  eunice:['Offer to cover the stall while Keira checks on her father.','“Twenty minutes is enough. You don’t have to fix his illness to give her twenty minutes.”'],
  leung:['Offer to telephone the patients who missed their appointments.','“Start with the ones nobody else will call. I’ll stay until you finish.”'],
  cheng:['Offer to walk her home after Iris returns.','“Walk beside me, then. I’ve spent enough years watching people hurry ahead.”'],
  wai:['Offer to call Kit and tell her he is safe.','“Don’t tell her I was brave. Tell her where I am. She can make up her own mind about the rest.”'],
  anita:['Offer to accompany her to the clinic.','“I’ll go if you come with me. Not because I owe you. Because I’d rather not go alone.”'],
  sam:['Offer to warn the crew before another departure.','“Use the radio by the stall. Tell them Sam says keep the ramp down. They’ll understand.”'],
  grace:['Offer to help her find somewhere warm to wait.','“Iris said there’s a tea stall. If we go, leave Henry a message. I won’t let him think I stopped looking.”'],
  henry:['Keep him company while Grace gets food.','You sit beside the bed and talk about ordinary things until his sister returns. This time, he knows where he is.'],
  bo:['Offer to carry the warning to the other riders.','“Tell them it’s my decision. They shouldn’t lose a shift because they believed a stranger.”'],
  tessa:['Offer to tell Kit what she found.','“Tell her I looked for Wai. People assume the housekeepers don’t notice who disappears.”'],
  patrick:['Offer to take his account to Mei.','“She needs the clause, not my excuses. But if she asks why I waited, give her those too.”'],
  lily:['Offer to accompany her when she speaks to her mother.','“Stay at the door. I need to be the one who asks. I just don’t want to do it alone.”'],
  ming:['Offer to help clear the flood-damaged stock.','“Careful with that box. The prints are dry. The flour wasn’t so lucky.”'],
  aaron:['Offer to speak with Marcus without blaming him.','“Tell him I counted right. Then tell him I listened when he said to stay away. Both things can be true.”'],
  nora:['Offer to help Mei finish the waiting-room calls.','“Good. Make sure Mei eats something before she decides she’s done for the night.”'],
  kit:['Offer to meet her at the market.','“I’ll wait by Ming’s stall. If Wai comes first, tell him he doesn’t need an explanation ready.”'],
  ruth:['Offer to label the photographs with her.','You write the dates as she reads them aloud. By the last envelope, she says Owen’s name without checking it first.'],
  fong:['Offer to check on the older tenants before you leave.','“Mrs. Cheng’s landing light is broken. I have a bulb downstairs.” He gives you the key before asking when the rent will arrive.']
 };
 for(const [id,name,role,number,place,greeting,ask,answer,effect] of supporting){
  cast[id]={name,role};
  const ch=chapters[number-1];ch.people[place]=[...(ch.people[place]||[]),id];
  ch.conversations[id]=talk(greeting,[
   topic(id+'_account',ask,answer,{...effect,set:[...(effect.set||[]),id+'_heard']}),
   topic(id+'_care',care[id][0],care[id][1],{requires:[id+'_heard'],trust:1,humanity:1})
  ]);
 }
 const endings={
  protect:{title:'A Life of Your Own',text:'You refuse the throne. The demon stays, bound to a new promise: your life belongs to you. Tomorrow, Ada knocks on your door. Keira needs someone to carry a crate. The city has not become safe. It has become yours to live in.'},
  ascend:{title:'The Last Survivor',text:'You take the keeper’s place. The city opens beneath you like a ledger. Every name has a cost; every cost has a number. For a moment you remember the person who once needed rent money. Then someone below makes a promise, and you turn to listen.'},
  sever:{title:'No More Borrowed Souls',text:'You break the bond instead of replacing its owner. The voice leaves with no body to hide inside. Across the city, people wake from dreams they will never explain. You wake on the roof with Iris beside you. Neither of you can hear the hundred anymore.'}
 };
 // Introductions accompany the first greeting; they are not an extra paid action.
 // Ada and Mr. Fong are already part of the player's life before the story begins.
 const introductions={
  keira:'I’m Keira Ho. This is my stall; make yourself comfortable.',
  marcus:'Marcus Yip. I deliver around here, if you need directions.',
  iris:'I’m Iris Cheng. I’m a student; I’m usually out late after classes.',
  vincent:'I’m Vincent Lau, a consultant for the hotel.',
  daniel:'Daniel Ko, front desk. What can I help you with?',
  yuen:'People here call me Mr. Yuen. I look after the shrine.',
  mei:'I’m Mei Wong, one of the community nurses.',
  celia:'Celia Tang. I administer the relief fund here.',
  owen:'Owen Chan. I take photographs for a living.',
  jun:'Jun Mak. I’m the dispatcher for this ferry.',
  sora:'Sora Lam. You can call me an archivist.',
  eunice:'I’m Eunice Ho. I help look after Keira’s father.',
  leung:'Dr. Leung. I cover the late shift at this clinic.',
  cheng:'Mrs. Cheng. Iris is my granddaughter.',
  wai:'Wai Cheung. I work as a porter at the hotel. Kit is my sister.',
  anita:'Anita So. I applied to the relief fund for help with a hospital bill.',
  sam:'Sam Wu. I maintain the ferry and its ramp.',
  grace:'I’m Grace Poon. Henry is my brother.',
  henry:'Henry Poon. I work on the ferry. Grace is my sister.',
  bo:'Bo Lee. I run dispatch for the delivery riders.',
  tessa:'Tessa Lau. I clean the hotel rooms and offices.',
  patrick:'Patrick Ng. I was asked to audit the relief fund.',
  lily:'My name is Lily Lam. Sora, the archivist, is my mother.',
  ming:'Ming Tse. This is my stall.',
  aaron:'I’m Aaron Yip, Marcus’s younger brother. I make deliveries between classes.',
  nora:'Nora Wong. I worked with Mei before I retired from community nursing.',
  kit:'I’m Kit Cheung. Wai, the hotel porter, is my brother.',
  ruth:'Ruth Chan. Owen is my son. That’s what the names on the photographs tell me.'
 };
 for(const ch of chapters)for(const [id,scene]of Object.entries(ch.conversations)){
  if(introductions[id])scene.firstGreeting=introductions[id]+' '+scene.greeting;
 }
 function chapter(number){return chapters[number-1]||chapters[0]}
 function conversation(state,id){
  const scene=chapter(state.chapter||1).conversations[id]||talk('The city keeps moving. For a moment, there is nothing urgent to say.',[topic('quiet_'+id,'Share a quiet moment.','For once, neither of you tries to turn the silence into an answer.',{trust:1})]);
  const firstGreeting=scene.firstGreeting||(introductions[id]?introductions[id]+' '+scene.greeting:null);
  return firstGreeting&&!state.spokeTo?.includes(id)?{...scene,greeting:firstGreeting}:scene;
 }
 function occupants(state,place){return (chapter(state.chapter||1).people[place]||[]).filter(id=>!state.defeated?.includes(id)||id==='jun')}
 return {...Base,cast,places,chapters,supportingCast,endings,chapter,conversation,occupants};
});
