> **Offline teaching derivative**  
> Source: `fastapi/fastapi@c3f316b7e814667e8ee81e03a7330d00ee61e45c`  
> Upstream path: `docs/en/docs/deployment/fastapicloud.md`  
> Upstream Git blob: `d9e7694736620482da7c59bc7d7808007d8c0850`  
> Transform: `markdown-normalize`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

# FastAPI Cloud { #fastapi-cloud }

You can deploy your FastAPI app to [FastAPI Cloud](https://fastapicloud.com) with just **one command**. 🚀

<div class="termy">

```console
$ uv run fastapi deploy

Deploying to FastAPI Cloud...

✅ Deployment successful!

🐔 Ready the chicken! Your app is ready at https://myapp.fastapicloud.dev
```

</div>

The CLI will automatically detect your FastAPI application and deploy it to the cloud. If you are not logged in, your browser will open to complete the authentication process.

That's it! Now you can access your app at that URL. ✨

## About FastAPI Cloud { #about-fastapi-cloud }

**[FastAPI Cloud](https://fastapicloud.com)** is built by the same author and team behind **FastAPI**.

It streamlines the process of **building**, **deploying**, and **accessing** an API with minimal effort.

It brings the same **developer experience** of building apps with FastAPI to **deploying** them to the cloud. 🎉

It will also take care of most of the things you would need when deploying an app, like:

* HTTPS
* Replication, with autoscaling based on requests
* etc.

FastAPI Cloud is the primary sponsor and funding provider for the *FastAPI and friends* open source projects. ✨

## Deploy to other cloud providers { #deploy-to-other-cloud-providers }

FastAPI is open source and based on standards. You can deploy FastAPI apps to any cloud provider you choose.

Follow your cloud provider's guides to deploy FastAPI apps with them. 🤓

## Deploy your own server { #deploy-your-own-server }

I will also teach you later in this **Deployment** guide all the details, so you can understand what is going on, what needs to happen, or how to deploy FastAPI apps on your own, also with your own servers. 🤓
