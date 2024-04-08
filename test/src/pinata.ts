const JWT = "";

export async function upload(obj: object): Promise<string> {
  try {
    const text = JSON.stringify(obj);
    const blob = new Blob([text], { type: "text/plain" });
    const data = new FormData();
    data.append("file", blob);

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${JWT}`,
      },
      body: data,}
    );
    const resData = await res.json();
    console.log(resData);

	return resData.IpfsHash;

  } catch (error) {
    console.log(error);
  }
};

export async function download(ipfs: string): Promise<object> {
	try {  
	  const res = await fetch("x" + ipfs);
	  const resData = await res.json();
	  console.log(resData);
  
	  return resData;
  
	} catch (error) {
	  console.log(error);
	}
};