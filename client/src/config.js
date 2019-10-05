/*
 * Maintained by jemo from 2019.10.5 9:52:45
 * Created by jemo on 2019.10.5
 * config
 */

const productionENV = process.env.NODE_ENV === 'production'
const productionURL = 'https://destpact.com'
const developmentURL = process.env.REACT_APP_SECRET_CODE

export const apiUrl = productionENV ? productionURL : developmentURL
