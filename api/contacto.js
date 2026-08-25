const nodemailer=require("nodemailer");
const c=(v,m=4000)=>String(v??"").replace(/[<>]/g,"").trim().slice(0,m);
module.exports=async(req,res)=>{
 if(req.method!=="POST"){res.setHeader("Allow","POST");return res.status(405).json({ok:false})}
 try{
  const b=req.body||{},nombre=c(b.nombre,120),telefono=c(b.telefono,60),email=c(b.email,180),tipo=c(b.tipo,180),mensaje=c(b.mensaje);
  if(!nombre||!telefono||!email||!mensaje)return res.status(400).json({ok:false});
  const port=Number(process.env.SMTP_PORT||465);
  const tr=nodemailer.createTransport({host:process.env.SMTP_HOST,port,secure:String(process.env.SMTP_SECURE??"true")==="true",auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}});
  await tr.sendMail({from:`"PuntoRecicla" <${process.env.SMTP_USER}>`,to:process.env.CONTACT_EMAIL||process.env.SMTP_USER,replyTo:email,subject:"Nueva consulta PuntoRecicla",text:`Nombre: ${nombre}\nTeléfono: ${telefono}\nEmail: ${email}\nTipo: ${tipo}\n\n${mensaje}`});
  res.status(200).json({ok:true});
 }catch(e){console.error(e);res.status(500).json({ok:false})}
};