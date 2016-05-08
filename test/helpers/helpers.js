module.exports = {
    attestationChallenge: "abc123def456",
    userId: "adam@fidoalliance.org",
    validMakeCredential: {
        credential: {
            type: 'ScopedCred',
            id: '8DD7414D-EE43-474C-A05D-FDDB828B663B'
        },
        publicKey: {
            kty: 'RSA',
            alg: 'RS256',
            ext: false,
            n: 'lMR4XoxRiY5kptgHhh1XLKnezHC2EWPIImlHS-iUMSKVH32WWUKfEoY5Al_exPtcVuUfcNGtMoysAN65PZzcMKXaQ-2a8AebKwe8qQGBc4yY0EkP99Sgb80rAf1S7s-JRNVtNTRb4qrXVCMxZHu3ubjsdeybMI-fFKzYg9IV6DPotJyx1OpNSdibSwWKDTc5YzGfoOG3vA-1ae9oFOh5ZolhHnr5UkodFKUaxOOHfPrAB0MVT5Y5Stvo_Z_1qFDOLyOWdhxxzl2at3K9tyQC8kgJCNKYsq7-EFzvA9Q90PC6SxGATQoICKn2vCNMBqVHLlTydBmP7-8MoMxefM277w',
            e: 'AQAB'
        },
        attestation: null
    },
    validGetAssertion: {
        credential: {
            type: 'ScopedCred',
            id: '8DD7414D-EE43-474C-A05D-FDDB828B663B'
        },
        clientData: 'ew0KCSJjaGFsbGVuZ2UiIDogImFiYzEyM2RlZjQ1NiINCn0A',
        authenticatorData: 'AQAAAAA',
        signature: 'g22nh1Ww-qZAysuizkugZGmEisax3dtoUNzIl2LWOSARzeZxm_-nQoHfKyo8b8_XnxXwuLlW8RXBLAN38D3V2PBugPRloVzE1gn4Vl7Ro124GqPyURNllvNkD3EAl64bHPK-EVIOmI8zk0QK_ZoqfAKY_RfMLNObSn47H_hdA-YZUGEkWtcyUgC65H9xfhFWOQdg-r_pHY5_TxgdSNR8itkBb2xZGKagFnGUtdmOSRROVwK9AalJwsJD1W4lF5_4Jfumsb1YJ6yQwrPhJuYNCCeVHXIahXDUKTdTtWQs0MTj7kGi1j-_lkNpl7rEnSV4wqw8K5SEcHM-mEBYX-fMDw'
    }
};
