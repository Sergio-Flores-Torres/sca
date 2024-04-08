
export async function download(ipfs: string): Promise<object> {
	try {  
	  const res = await fetch(process.env.GATEWAY + ipfs);
	  const resData = await res.json();
	  console.log(resData);
  
	  return resData;
  
	} catch (error) {
	  console.log(error);
	}
};