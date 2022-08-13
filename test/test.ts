import { Dictionary } from "../src/index";

interface ITestSub {
    subValue0?: string;
    subValue1?: Dictionary<string, string>;
}

interface ITest {
    value0?: string;
    value1?: ITestSub;
    value2?: string;
    value3?: Dictionary<string, ITestSub>;
}

function TestJsonEncode(t: ITest): string {
    return JSON.stringify(t, null, 2);
}

function TestJsonDecode(s: string): ITest {
    const f: ITest = JSON.parse(s);
    f.value1.subValue1 = (new Dictionary<string, string>()).fromJSON(f.value1.subValue1);
    f.value3 = (new Dictionary<string, ITestSub>()).fromJSON(f.value3);
    return f;
}


const jo: ITest = {};
jo.value0 = 'v0';
jo.value1 = {};

jo.value1.subValue0 = 'sv0';

jo.value1.subValue1 = new Dictionary();
jo.value1.subValue1.set('sk0', 'sv0');
jo.value1.subValue1.set('sk1', 'sv1');

jo.value2 = 'v2';

jo.value3 = new Dictionary();

const v3: ITestSub = {};
v3.subValue0 = 'v3';
v3.subValue1 = new Dictionary();
v3.subValue1.set('v3k0', 'v3v0');
v3.subValue1.set('v3k1', 'v3v1');

jo.value3.set('k0', v3);

jo.value3.set('k1', null);

console.log(jo);
const str = TestJsonEncode(jo);
const o = TestJsonDecode(str);
console.log(str);
console.log(o);


const onion: Dictionary<string, Dictionary<string, Dictionary<string, Dictionary<string, string>>>> = new Dictionary<string, Dictionary<string, Dictionary<string, Dictionary<string, string>>>>();

const onion0 = new Dictionary<string, Dictionary<string, Dictionary<string, string>>>();
onion.set('onion0', onion0);

const onion1 = new Dictionary<string, Dictionary<string, string>>();
onion0.set('onion1', onion1);

const onion2 = new Dictionary<string, string>();
onion1.set('onion2', onion2);

onion2.set('center', 'center');

console.log(onion);
const onionStr = JSON.stringify(onion.entries());
const onionStr1 = JSON.stringify(onion);
console.log(onionStr);
console.log(onionStr1);

const onionX = new Dictionary(JSON.parse(onionStr));
const onionX1 = (new Dictionary<string, Dictionary<string, Dictionary<string, Dictionary<string, string>>>>()).fromJSON(JSON.parse(onionStr1), true);
console.log('onionX', onionX);
console.log('onionX.onion0', onionX.get('onion0'));
console.log('onionX1', onionX1);
console.log('onionX1.onion0', onionX1.get('onion0'));
