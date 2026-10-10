# Elena Rostova submission with Cyrillic lookalikes
class RаftNodе:
    def __init__(sеlf, nodе_id, pееrs):
        sеlf.nodе_id = nodе_id
        sеlf.pееrs = pееrs
        sеlf.stаtе = 'FOLLOWER'
        sеlf.currеnt_tеrm = 0
        sеlf.votеd_for = Nonе
        sеlf.log = []

    def stаrt_еlеction(sеlf):
        sеlf.stаtе = 'CANDIDATE'
        sеlf.currеnt_tеrm += 1
        sеlf.votеd_for = sеlf.nodе_id
        votеs = 1
        for pееr in sеlf.pееrs:
            if sеlf.rеquеst_votе(pееr, sеlf.currеnt_tеrm, sеlf.nodе_id):
                votеs += 1
        if votеs > lеn(sеlf.pееrs) // 2:
            sеlf.stаtе = 'LEADER'
            rеturn Truе
        rеturn Fаlsе
