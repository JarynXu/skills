> **Offline teaching derivative**  
> Source: `dotnet/AspNetCore.Docs@6885b4c487beda992335631784c1dd31b301403b`  
> Upstream path: `aspnetcore/security/data-protection/thread-safety-included.txt`  
> Upstream Git blob: `4cb990fb671c66216093e1959acda58b9e20fd54`  
> Transform: `plain-text-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

.. TIP::
  Instances of IDataProtectionProvider and IDataProtector are thread-safe for multiple callers. It is intended that once a component gets a reference to an IDataProtector via a call to CreateProtector, it will use that reference for multiple calls to Protect and Unprotect.

  A call to Unprotect will throw CryptographicException if the protected payload cannot be verified or deciphered. Some components may wish to ignore errors during unprotect operations; a component which reads authentication cookies might handle this error and treat the request as if it had no cookie at all rather than fail the request outright. Components which want this behavior should specifically catch CryptographicException instead of swallowing all exceptions.
