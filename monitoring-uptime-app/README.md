In folder *https* run the following terminal command

```
  > openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem
  Generating a 2048 bit RSA private key
  ...............................+++
  ................+++
  writing new private key to 'key.pem'
  -----
  You are about to be asked to enter information that will be incorporated
  into your certificate request.
  What you are about to enter is what is called a Distinguished Name or a DN.
  There are quite a few fields but you can leave some blank
  For some fields there will be a default value,
  If you enter '.', the field will be left blank.
  -----
  Country Name (2 letter code) []:<fill in>
  State or Province Name (full name) []:<fill in>
  Locality Name (eg, city) []:<fill in>
  Organization Name (eg, company) []:<fill in>
  Organizational Unit Name (eg, section) []:
  Common Name (eg, fully qualified host name) []:localhost
  Email Address []:<fill in>
 ```